import asyncio
import subprocess
import json
import re
import socket
import struct
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import netifaces
import ipaddress

logger = logging.getLogger(__name__)

class NetworkDevice:
    def __init__(self, ip: str, mac: str = None, hostname: str = None, 
                 vendor: str = None, device_type: str = "unknown", 
                 open_ports: List[int] = None):
        self.ip = ip
        self.mac = mac
        self.hostname = hostname
        self.vendor = vendor
        self.device_type = device_type
        self.open_ports = open_ports or []
        self.last_seen = datetime.utcnow()
        self.first_seen = datetime.utcnow()
        self.status = "online"

    def to_dict(self) -> Dict:
        return {
            "ip": self.ip,
            "mac": self.mac,
            "hostname": self.hostname,
            "vendor": self.vendor,
            "device_type": self.device_type,
            "open_ports": self.open_ports,
            "last_seen": self.last_seen,
            "first_seen": self.first_seen,
            "status": self.status
        }

class NetworkDiscoveryService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.discovered_devices: Dict[str, NetworkDevice] = {}
        self.running = False
        self.discovery_task = None
        self.scan_interval = 300  # 5 minutes
        self.quick_scan_interval = 60  # 1 minute for quick checks
        
    async def start_background_discovery(self):
        """Start the background network discovery service."""
        if self.running:
            return
            
        self.running = True
        logger.info("Starting background network discovery service")
        
        # Start both discovery tasks
        self.discovery_task = asyncio.create_task(self._discovery_loop())
        self.quick_check_task = asyncio.create_task(self._quick_check_loop())
        
    async def stop_background_discovery(self):
        """Stop the background network discovery service."""
        self.running = False
        if self.discovery_task:
            self.discovery_task.cancel()
        if hasattr(self, 'quick_check_task'):
            self.quick_check_task.cancel()
        logger.info("Stopped background network discovery service")
        
    async def _discovery_loop(self):
        """Main discovery loop that runs comprehensive scans."""
        while self.running:
            try:
                await self._perform_network_discovery()
                await asyncio.sleep(self.scan_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in discovery loop: {e}")
                await asyncio.sleep(30)  # Wait 30 seconds before retrying
                
    async def _quick_check_loop(self):
        """Quick check loop for monitoring known devices."""
        while self.running:
            try:
                await self._quick_device_check()
                await asyncio.sleep(self.quick_scan_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in quick check loop: {e}")
                await asyncio.sleep(10)
                
    async def _perform_network_discovery(self):
        """Perform comprehensive network discovery."""
        logger.info("Starting comprehensive network discovery")
        
        try:
            # Get local network ranges
            network_ranges = await self._get_local_networks()
            
            for network in network_ranges:
                try:
                    logger.info(f"Scanning network: {network}")
                    
                    # ARP scan for active devices
                    arp_devices = await self._arp_scan(network)
                    logger.info(f"ARP scan found {len(arp_devices)} devices in {network}")
                    
                    # Ping sweep for additional devices
                    ping_devices = await self._ping_sweep(network)
                    logger.info(f"Ping sweep found {len(ping_devices)} devices in {network}")
                    
                    # Combine results
                    all_ips = set(arp_devices.keys()) | set(ping_devices.keys())
                    
                    for ip in all_ips:
                        try:
                            device = arp_devices.get(ip) or ping_devices.get(ip)
                            if device:
                                # Enhanced device detection
                                await self._enhance_device_info(device)
                                
                                # Update or add device
                                await self._update_device(device)
                                logger.debug(f"Updated device: {device.ip}")
                                
                        except Exception as e:
                            logger.error(f"Error processing device {ip}: {e}")
                            
                except Exception as e:
                    logger.error(f"Error scanning network {network}: {e}")
                    
            # Clean up old devices
            await self._cleanup_old_devices()
            
            logger.info(f"Network discovery completed. Found {len(self.discovered_devices)} devices")
            
        except Exception as e:
            logger.error(f"Error in network discovery: {e}")
            import traceback
            traceback.print_exc()
        
    async def _get_local_networks(self) -> List[str]:
        """Get local network ranges to scan."""
        networks = []
        
        try:
            # Get all network interfaces
            interfaces = netifaces.interfaces()
            
            for interface in interfaces:
                addrs = netifaces.ifaddresses(interface)
                if netifaces.AF_INET in addrs:
                    for addr_info in addrs[netifaces.AF_INET]:
                        ip = addr_info.get('addr')
                        netmask = addr_info.get('netmask')
                        
                        if ip and netmask and not ip.startswith('127.'):
                            try:
                                network = ipaddress.IPv4Network(f"{ip}/{netmask}", strict=False)
                                networks.append(str(network))
                            except:
                                pass
                                
        except Exception as e:
            logger.error(f"Error getting local networks: {e}")
            # Fallback to common private networks
            networks = ["192.168.1.0/24", "192.168.0.0/24", "10.0.0.0/24"]
            
        return networks
        
    async def _arp_scan(self, network: str) -> Dict[str, NetworkDevice]:
        """Perform ARP scan to discover devices."""
        devices = {}
        
        try:
            # Use arp-scan if available
            proc = await asyncio.create_subprocess_exec(
                'arp-scan', '-l', '-g',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            
            if proc.returncode == 0:
                lines = stdout.decode().strip().split('\n')
                for line in lines:
                    if re.match(r'^\d+\.\d+\.\d+\.\d+', line):
                        parts = line.split()
                        if len(parts) >= 2:
                            ip = parts[0]
                            mac = parts[1]
                            vendor = ' '.join(parts[2:]) if len(parts) > 2 else None
                            
                            device = NetworkDevice(ip=ip, mac=mac, vendor=vendor)
                            devices[ip] = device
                            
        except FileNotFoundError:
            # Fallback to system ARP table
            try:
                proc = await asyncio.create_subprocess_exec(
                    'arp', '-a',
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await proc.communicate()
                
                if proc.returncode == 0:
                    lines = stdout.decode().strip().split('\n')
                    for line in lines:
                        match = re.search(r'\((\d+\.\d+\.\d+\.\d+)\) at ([a-fA-F0-9:]{17})', line)
                        if match:
                            ip = match.group(1)
                            mac = match.group(2)
                            
                            device = NetworkDevice(ip=ip, mac=mac)
                            devices[ip] = device
                            
            except Exception as e:
                logger.error(f"Error in ARP scan fallback: {e}")
                
        except Exception as e:
            logger.error(f"Error in ARP scan: {e}")
            
        return devices
        
    async def _ping_sweep(self, network: str) -> Dict[str, NetworkDevice]:
        """Perform ping sweep to discover active devices."""
        devices = {}
        
        try:
            # Use nmap for ping sweep
            proc = await asyncio.create_subprocess_exec(
                'nmap', '-sn', '-n', network,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            
            if proc.returncode == 0:
                lines = stdout.decode().strip().split('\n')
                for line in lines:
                    if 'Nmap scan report for' in line:
                        ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                        if ip_match:
                            ip = ip_match.group(1)
                            if ip not in devices:
                                device = NetworkDevice(ip=ip)
                                devices[ip] = device
                                
        except Exception as e:
            logger.error(f"Error in ping sweep: {e}")
            
        return devices
        
    async def _enhance_device_info(self, device: NetworkDevice):
        """Enhance device information with additional details."""
        try:
            # Try to get hostname
            if not device.hostname:
                try:
                    hostname = socket.gethostbyaddr(device.ip)[0]
                    device.hostname = hostname
                except:
                    pass
                    
            # Quick port scan for device type detection
            common_ports = [22, 23, 53, 80, 135, 139, 443, 445, 993, 995]
            device.open_ports = await self._quick_port_scan(device.ip, common_ports)
            
            # Determine device type based on open ports and other info
            device.device_type = self._determine_device_type(device)
            
        except Exception as e:
            logger.error(f"Error enhancing device info for {device.ip}: {e}")
            
    async def _quick_port_scan(self, ip: str, ports: List[int]) -> List[int]:
        """Perform quick port scan on common ports."""
        open_ports = []
        
        async def check_port(port):
            try:
                reader, writer = await asyncio.wait_for(
                    asyncio.open_connection(ip, port),
                    timeout=1.0
                )
                writer.close()
                await writer.wait_closed()
                return port
            except:
                return None
                
        tasks = [check_port(port) for port in ports]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, int):
                open_ports.append(result)
                
        return open_ports
        
    def _determine_device_type(self, device: NetworkDevice) -> str:
        """Determine device type based on available information."""
        if not device.open_ports:
            return "unknown"
            
        # Router/Gateway detection
        if 80 in device.open_ports or 443 in device.open_ports:
            if device.ip.endswith('.1') or device.ip.endswith('.254'):
                return "router"
                
        # Server detection
        if 22 in device.open_ports:  # SSH
            return "server"
        if 135 in device.open_ports or 445 in device.open_ports:  # Windows
            return "windows_host"
        if 53 in device.open_ports:  # DNS
            return "dns_server"
            
        # Default based on hostname
        if device.hostname:
            hostname_lower = device.hostname.lower()
            if any(term in hostname_lower for term in ['router', 'gateway', 'fw']):
                return "router"
            elif any(term in hostname_lower for term in ['server', 'srv']):
                return "server"
            elif any(term in hostname_lower for term in ['printer', 'print']):
                return "printer"
                
        return "host"
        
    async def _update_device(self, device: NetworkDevice):
        """Update device in database and local cache."""
        # Update local cache
        if device.ip in self.discovered_devices:
            existing = self.discovered_devices[device.ip]
            existing.last_seen = datetime.utcnow()
            existing.status = "online"
            # Update other fields if they're not set
            if not existing.mac and device.mac:
                existing.mac = device.mac
            if not existing.hostname and device.hostname:
                existing.hostname = device.hostname
            if not existing.vendor and device.vendor:
                existing.vendor = device.vendor
            existing.open_ports = device.open_ports
            existing.device_type = device.device_type
        else:
            self.discovered_devices[device.ip] = device
            
        # Update database
        await self.db["network_devices"].update_one(
            {"ip": device.ip},
            {
                "$set": device.to_dict(),
                "$setOnInsert": {"first_seen": device.first_seen}
            },
            upsert=True
        )
        
    async def _quick_device_check(self):
        """Quick check of known devices to update their status."""
        if not self.discovered_devices:
            return
            
        # Check a subset of devices each time
        device_list = list(self.discovered_devices.values())
        batch_size = min(10, len(device_list))
        
        for i in range(0, len(device_list), batch_size):
            batch = device_list[i:i + batch_size]
            
            for device in batch:
                try:
                    # Simple ping check
                    proc = await asyncio.create_subprocess_exec(
                        'ping', '-c', '1', '-W', '1', device.ip,
                        stdout=asyncio.subprocess.DEVNULL,
                        stderr=asyncio.subprocess.DEVNULL
                    )
                    await proc.communicate()
                    
                    if proc.returncode == 0:
                        device.last_seen = datetime.utcnow()
                        device.status = "online"
                    else:
                        # Mark as offline if not seen for more than 10 minutes
                        if datetime.utcnow() - device.last_seen > timedelta(minutes=10):
                            device.status = "offline"
                            
                    # Update database
                    await self.db["network_devices"].update_one(
                        {"ip": device.ip},
                        {"$set": {
                            "last_seen": device.last_seen,
                            "status": device.status
                        }}
                    )
                    
                except Exception as e:
                    logger.error(f"Error checking device {device.ip}: {e}")
                    
    async def _cleanup_old_devices(self):
        """Remove devices that haven't been seen for a long time."""
        cutoff_time = datetime.utcnow() - timedelta(days=7)
        
        # Remove from local cache
        to_remove = []
        for ip, device in self.discovered_devices.items():
            if device.last_seen < cutoff_time:
                to_remove.append(ip)
                
        for ip in to_remove:
            del self.discovered_devices[ip]
            
        # Remove from database
        await self.db["network_devices"].delete_many({
            "last_seen": {"$lt": cutoff_time}
        })
        
    async def get_discovered_devices(self) -> List[Dict]:
        """Get all discovered devices."""
        try:
            # Return from database for most up-to-date info
            cursor = self.db["network_devices"].find({})
            devices = await cursor.to_list(length=None)
            
            # Convert ObjectId to string for JSON serialization
            for device in devices:
                if "_id" in device:
                    device["_id"] = str(device["_id"])
                    
            return devices
        except Exception as e:
            logger.error(f"Error getting discovered devices: {e}")
            return []
        
    async def get_network_map(self) -> Dict:
        """Get network map data for visualization."""
        devices = await self.get_discovered_devices()
        
        nodes = []
        connections = []
        
        for device in devices:
            nodes.append({
                "id": device["ip"],
                "name": device.get("hostname") or device["ip"],
                "type": device.get("device_type", "unknown"),
                "status": device.get("status", "unknown"),
                "ip": device["ip"],
                "mac": device.get("mac"),
                "vendor": device.get("vendor"),
                "open_ports": device.get("open_ports", [])
            })
            
        # Create connections based on network topology
        # This is a simplified approach - in reality, you'd need more sophisticated topology detection
        gateway_ips = [device["ip"] for device in devices if device.get("device_type") == "router"]
        
        for device in devices:
            if device.get("device_type") != "router" and gateway_ips:
                # Connect non-router devices to the first router found
                connections.append({
                    "source": gateway_ips[0],
                    "target": device["ip"],
                    "type": "direct"
                })
                
        return {
            "nodes": nodes,
            "connections": connections
        }
