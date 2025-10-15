from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Any, Dict, List, Optional
import asyncio
import os
import re
import shutil
import xml.etree.ElementTree as ET

from app.services.auth import get_current_user
from app.models.user import UserInDB
from app.core.config import settings
from app.core.database import get_database
from app.services.network_discovery import NetworkDiscoveryService

router = APIRouter()

# In-memory cache for latest network map
_cached_map: Dict[str, Any] | None = None
_last_scan_error: str | None = None

def get_network_discovery_service() -> NetworkDiscoveryService:
    """Get network discovery service instance."""
    # Import here to avoid circular imports
    from app.main import network_discovery_service
    
    if network_discovery_service is None:
        raise HTTPException(
            status_code=503, 
            detail="Network discovery service is not available. Please try again later."
        )
    
    return network_discovery_service

async def get_local_cidr() -> str:
    """Discover the primary local IPv4 CIDR for scanning (e.g., 192.168.1.0/24)."""
    try:
        proc = await asyncio.create_subprocess_shell(
            "ip -o -f inet addr show | awk '{print $4}'",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        cidrs = stdout.decode().strip().splitlines()
        # Prefer private ranges
        private_patterns = [r"^10\.", r"^192\.168\.", r"^172\.(1[6-9]|2[0-9]|3[0-1])\."]
        for cidr in cidrs:
            if cidr.startswith("127."):
                continue
            if any(re.match(p, cidr.split('/')[0]) for p in private_patterns):
                return cidr
        # Fallback: first non-loopback
        for cidr in cidrs:
            if not cidr.startswith("127."):
                return cidr
    except Exception:
        pass
    # Last resort
    return "192.168.1.0/24"

async def run_nmap_ping_sweep(cidr: str) -> List[Dict[str, Any]]:
    """Run a lightweight nmap ping sweep and parse results into nodes."""
    # Resolve nmap executable: prefer absolute NMAP_PATH, else look in PATH
    configured = getattr(settings, "NMAP_PATH", None)
    nmap_exec = None
    if configured and os.path.isabs(configured) and os.path.exists(configured):
        nmap_exec = configured
    else:
        nmap_exec = shutil.which(configured or "nmap")
    if not nmap_exec:
        raise HTTPException(status_code=500, detail="Nmap not found in PATH. Install nmap (e.g., sudo apt install nmap) or set NMAP_PATH to an absolute path.")

    # -sn: ping scan (no port scan), -n: no DNS resolution
    cmd = f"{nmap_exec} -sn -n {cidr}"
    proc = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        err = stderr.decode().strip() or stdout.decode().strip()
        raise HTTPException(status_code=500, detail=f"nmap failed: {err}")

    lines = stdout.decode().splitlines()
    nodes: List[Dict[str, Any]] = []
    current_ip: str | None = None

    for line in lines:
        line = line.strip()
        if line.startswith("Nmap scan report for"):
            # Formats: "Nmap scan report for 192.168.1.10" or "Nmap scan report for hostname (192.168.1.10)"
            m = re.search(r"\((\d+\.\d+\.\d+\.\d+)\)$", line)
            if m:
                current_ip = m.group(1)
            else:
                parts = line.split()
                current_ip = parts[-1]
            nodes.append({
                "id": current_ip or "unknown",
                "name": current_ip or "unknown",
                "type": "host",
                "status": "online",
                "ip": current_ip or "",
            })
        # Could parse MAC lines if needed

    # Add a synthetic router node if in CIDR
    gateway_ip = None
    try:
        proc_gw = await asyncio.create_subprocess_shell(
            "ip route | awk '/default/ {print $3; exit}'",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        gw_out, _ = await proc_gw.communicate()
        gateway_ip = gw_out.decode().strip() or None
    except Exception:
        gateway_ip = None

    if gateway_ip and not any(n.get("ip") == gateway_ip for n in nodes):
        nodes.insert(0, {
            "id": gateway_ip,
            "name": "Gateway",
            "type": "device",
            "status": "online",
            "ip": gateway_ip,
        })

    # Build simple connections from gateway to others
    connections = []
    if gateway_ip:
        for n in nodes:
            if n.get("ip") != gateway_ip:
                connections.append({"source": gateway_ip, "target": n.get("ip"), "type": "direct"})

    return [{"nodes": nodes, "connections": connections}][0]

@router.get("/map", summary="Get local network map", tags=["Network"])
async def get_network_map(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Return network map from discovery service or fallback to cached map."""
    global _cached_map, _last_scan_error
    
    try:
        # Try to get from network discovery service first
        discovery_service = get_network_discovery_service()
        network_map = await discovery_service.get_network_map()
        
        if network_map and network_map.get("nodes"):
            return network_map
    except Exception as e:
        _last_scan_error = f"Discovery service error: {str(e)}"
    
    # Fallback to original implementation
    if _cached_map is None:
        # Run a first-time blocking scan
        cidr = await get_local_cidr()
        try:
            _cached_map = await run_nmap_ping_sweep(cidr)
            _last_scan_error = None
        except Exception as e:
            _last_scan_error = str(e)
            _cached_map = {"nodes": [], "connections": [], "error": _last_scan_error}
    else:
        # Kick off background refresh
        asyncio.create_task(_refresh_cache())

    return _cached_map

@router.get("/devices", summary="Get all discovered network devices", tags=["Network"])
async def get_discovered_devices(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database),
    include_vulns: bool = Query(False, description="Include per-device vulnerability counts")
) -> Dict[str, Any]:
    """Get all devices discovered by the background network discovery service."""
    try:
        discovery_service = get_network_discovery_service()
        devices = await discovery_service.get_discovered_devices()
        
        # Optionally enrich with vulnerability counts by IP
        if include_vulns and devices:
            for d in devices:
                ip = d.get("ip")
                if not ip:
                    d["vulnerabilities"] = 0
                    continue
                try:
                    # Count vulnerabilities where affected_components contains entries like "<ip>:<port>"
                    count = await db["vulnerabilities"].count_documents({
                        "affected_components": {"$elemMatch": {"$regex": f"^{ip}(:\\d+)?$"}}
                    })
                    d["vulnerabilities"] = int(count)
                except Exception:
                    d["vulnerabilities"] = 0
        
        return {
            "devices": devices,
            "total": len(devices),
            "online": len([d for d in devices if d.get("status") == "online"]),
            "offline": len([d for d in devices if d.get("status") == "offline"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get discovered devices: {str(e)}")

@router.get("/devices/{ip}", summary="Get specific device details", tags=["Network"])
async def get_device_details(ip: str, current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Get detailed information about a specific device."""
    try:
        discovery_service = get_network_discovery_service()
        devices = await discovery_service.get_discovered_devices()
        
        # Find the device
        device = next((d for d in devices if d.get("ip") == ip), None)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Get additional host details using the existing function
        host_details = await get_host_details_internal(ip)
        
        # Merge the information
        device.update(host_details)
        
        return device
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get device details: {str(e)}")

@router.post("/discovery/start", summary="Start network discovery", tags=["Network"])
async def start_network_discovery(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Manually start or restart the network discovery service."""
    try:
        discovery_service = get_network_discovery_service()
        await discovery_service.start_background_discovery()
        return {"message": "Network discovery started successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start network discovery: {str(e)}")

@router.post("/discovery/stop", summary="Stop network discovery", tags=["Network"])
async def stop_network_discovery(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Stop the network discovery service."""
    try:
        discovery_service = get_network_discovery_service()
        await discovery_service.stop_background_discovery()
        return {"message": "Network discovery stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop network discovery: {str(e)}")

@router.get("/discovery/status", summary="Get network discovery status", tags=["Network"])
async def get_discovery_status(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Get the status of the network discovery service."""
    try:
        discovery_service = get_network_discovery_service()
        return {
            "running": discovery_service.running,
            "discovered_devices_count": len(discovery_service.discovered_devices),
            "scan_interval": discovery_service.scan_interval,
            "quick_scan_interval": discovery_service.quick_scan_interval
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get discovery status: {str(e)}")

async def _refresh_cache():
    """Refresh the cached network map in the background."""
    global _cached_map, _last_scan_error
    try:
        cidr = await get_local_cidr()
        latest = await run_nmap_ping_sweep(cidr)
        _cached_map = latest
        _last_scan_error = None
    except Exception as e:
        _last_scan_error = str(e)

async def get_host_details_internal(ip: str) -> Dict[str, Any]:
    """Internal function to get host details (used by get_device_details)."""
    # MAC from ARP
    mac: Optional[str] = None
    try:
        proc_arp = await asyncio.create_subprocess_shell(
            f"ip neigh show {ip}",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        out_arp, _ = await proc_arp.communicate()
        line = out_arp.decode().strip()
        parts = line.split()
        if len(parts) >= 5:
            mac = parts[4] if parts[4] != "INCOMPLETE" else None
    except Exception:
        mac = None

    # nmap exec
    configured = getattr(settings, "NMAP_PATH", None)
    nmap_exec = None
    if configured and os.path.isabs(configured) and os.path.exists(configured):
        nmap_exec = configured
    else:
        nmap_exec = shutil.which(configured or "nmap")

    services: List[Dict[str, Any]] = []
    nmap_error: Optional[str] = None
    if nmap_exec:
        # Use XML output for robust parsing
        cmd = f"{nmap_exec} -sS -sV --top-ports 100 -Pn -n -oX - {ip}"
        proc = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode == 0:
            try:
                root = ET.fromstring(stdout.decode())
                for host in root.findall('.//host'):
                    for port in host.findall('.//ports/port'):
                        try:
                            portid = int(port.get('portid'))
                            state_el = port.find('state')
                            state = state_el.get('state') if state_el is not None else None
                            service_el = port.find('service')
                            service_name = service_el.get('name') if service_el is not None else None
                            version_parts = []
                            if service_el is not None:
                                for attr in ['product', 'version', 'extrainfo']:
                                    val = service_el.get(attr)
                                    if val:
                                        version_parts.append(val)
                            version = ' '.join(version_parts) if version_parts else None
                            services.append({
                                "port": portid,
                                "state": state,
                                "service": service_name,
                                "version": version,
                            })
                        except Exception:
                            continue
            except Exception:
                # Fallback: set error but keep going
                nmap_error = "Failed to parse nmap XML"
        else:
            nmap_error = (stderr.decode().strip() or stdout.decode().strip()) or "nmap failed"
    else:
        nmap_error = "nmap not available"

    return {
        "detailed_mac": mac,
        "services": services,
        "nmap_error": nmap_error,
    }

@router.get("/host", summary="Get host details (ports/services/MAC)", tags=["Network"])
async def get_host_details(ip: str, current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    """Return host service scan (top ports) and MAC address if known."""
    details = await get_host_details_internal(ip)
    return {
        "ip": ip,
        "mac": details["detailed_mac"],
        "services": details["services"],
        "nmap_error": details["nmap_error"],
    }

@router.get("/arp", summary="Get ARP table", tags=["Network"])
async def get_arp_table(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        proc = await asyncio.create_subprocess_shell(
            "ip neigh show",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        lines = stdout.decode().splitlines()
        entries = []
        for line in lines:
            parts = line.split()
            if len(parts) >= 5:
                ip = parts[0]
                mac = parts[4] if parts[4] != "INCOMPLETE" else None
                state = parts[-1]
                entries.append({"ip": ip, "mac": mac, "state": state})
        return {"items": entries}
    except Exception as e:
        return {"items": [], "error": str(e)}

@router.get("/info", summary="Get network info (gateway/DNS/DHCP)", tags=["Network"])
async def get_network_info(current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Optional[str]]:
    def read_cmd(cmd: str) -> str:
        return os.popen(cmd).read().strip()

    try:
        gateway = read_cmd("ip route | awk '/default/ {print $3; exit}'") or None
        dns = None
        resolv = read_cmd("awk '/^nameserver/ {print $2}' /etc/resolv.conf | head -n1")
        if resolv:
            dns = resolv
        # DHCP server often stored by NetworkManager; try nmcli
        dhcp = None
        nm_dhcp = read_cmd("nmcli -t -f DHCP4.OPTION device show 2>/dev/null | awk -F'=' '/dhcp_server_identifier/ {print $2; exit}'")
        if nm_dhcp:
            dhcp = nm_dhcp
        return {"gateway": gateway, "dns": dns, "dhcp": dhcp}
    except Exception as e:
        return {"gateway": None, "dns": None, "dhcp": None, "error": str(e)}