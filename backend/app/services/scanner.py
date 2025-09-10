from datetime import datetime
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from fastapi import HTTPException, status
import asyncio
import nmap
import json
import shutil
import os
import re

from app.models.base import PyObjectId
from app.models.scan import (
    ScanCreate,
    ScanInDB,
    VulnerabilityCreate,
    VulnerabilityInDB,
    ScanStatus,
    VulnerabilitySeverity
)
from app.core.config import settings

class Scanner:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.active_scans: Dict[str, asyncio.Task] = {}
        self.nm = nmap.PortScanner(nmap_search_path=[settings.NMAP_PATH])

    async def create_scan(self, user_id: str, scan_create: ScanCreate) -> ScanInDB:
        """Create a new scan."""
        # Check concurrent scans limit
        active_count = await self.db["scans"].count_documents({
            "user_id": ObjectId(user_id),
            "status": ScanStatus.IN_PROGRESS
        })
        if active_count >= settings.MAX_CONCURRENT_SCANS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum concurrent scans limit reached"
            )

        # Create scan document
        scan_dict = scan_create.model_dump()
        scan_dict["user_id"] = ObjectId(user_id)
        scan_dict["status"] = ScanStatus.PENDING
        scan_dict["created_at"] = datetime.utcnow()
        scan_dict["updated_at"] = datetime.utcnow()

        # Insert into database
        result = await self.db["scans"].insert_one(scan_dict)
        scan_dict["_id"] = result.inserted_id

        # Create scan object
        scan = ScanInDB(**scan_dict)

        # Start scan in background
        self.active_scans[str(scan.id)] = asyncio.create_task(
            self._run_scan(str(scan.id))
        )

        return scan

    async def _run_scan(self, scan_id: str) -> None:
        """Execute the scan."""
        try:
            # Get scan from database
            scan_dict = await self.db["scans"].find_one({"_id": ObjectId(scan_id)})
            if not scan_dict:
                return

            # Update status to in progress
            await self.db["scans"].update_one(
                {"_id": ObjectId(scan_id)},
                {
                    "$set": {
                        "status": ScanStatus.IN_PROGRESS,
                        "start_time": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # Run appropriate scan based on type
            scan = ScanInDB(**scan_dict)
            if scan.scan_type == "network":
                await self._run_network_scan(scan)
            elif scan.scan_type == "web":
                await self._run_web_scan(scan)
            elif scan.scan_type == "api":
                await self._run_api_scan(scan)
            elif scan.scan_type == "mobile":
                await self._run_mobile_scan(scan)

            # Update status to completed
            await self.db["scans"].update_one(
                {"_id": ObjectId(scan_id)},
                {
                    "$set": {
                        "status": ScanStatus.COMPLETED,
                        "end_time": datetime.utcnow(),
                        "progress": 100.0,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

        except Exception as e:
            # Update status to failed
            await self.db["scans"].update_one(
                {"_id": ObjectId(scan_id)},
                {
                    "$set": {
                        "status": ScanStatus.FAILED,
                        "end_time": datetime.utcnow(),
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        finally:
            # Remove from active scans
            self.active_scans.pop(scan_id, None)

    async def _run_network_scan(self, scan: ScanInDB) -> None:
        """Execute network scan."""
        try:
            # Configure scan arguments
            args = f"-sV -sC"
            if scan.port_range:
                args += f" -p {scan.port_range}"
            if scan.intensity:
                args += f" -T{scan.intensity}"
            if scan.custom_scripts:
                args += f" --script={','.join(scan.custom_scripts)}"

            # Run nmap scan
            self.nm.scan(scan.target, arguments=args)

            # Process results
            for host in self.nm.all_hosts():
                for proto in self.nm[host].all_protocols():
                    ports = self.nm[host][proto].keys()
                    for port in ports:
                        service = self.nm[host][proto][port]
                        if 'script' in service:
                            for script_name, output in service['script'].items():
                                await self._create_vulnerability(
                                    scan.id,
                                    name=f"{script_name} on port {port}",
                                    description=output,
                                    severity=self._determine_severity(output),
                                    affected_components=[f"{host}:{port}"]
                                )

            # Update progress
            await self._update_scan_progress(scan.id, 100.0)

        except Exception as e:
            raise Exception(f"Network scan failed: {str(e)}")

    async def _run_web_scan(self, scan: ScanInDB) -> None:
        """Execute web application scan."""
        # Implement web scanning logic here
        pass

    async def _run_api_scan(self, scan: ScanInDB) -> None:
        """Execute API scan."""
        # Implement API scanning logic here
        pass

    async def _run_mobile_scan(self, scan: ScanInDB) -> None:
        """Execute mobile application scan."""
        # Implement mobile scanning logic here
        pass

    async def _create_vulnerability(
        self,
        scan_id: PyObjectId,
        name: str,
        description: str,
        severity: VulnerabilitySeverity,
        affected_components: Optional[List[str]] = None,
        cvss_score: Optional[float] = None,
        cve_ids: Optional[List[str]] = None,
        remediation: Optional[str] = None,
        references: Optional[List[str]] = None
    ) -> VulnerabilityInDB:
        """Create a vulnerability finding."""
        vuln_dict = {
            "scan_id": scan_id,
            "name": name,
            "description": description,
            "severity": severity,
            "affected_components": affected_components,
            "cvss_score": cvss_score,
            "cve_ids": cve_ids,
            "remediation": remediation,
            "references": references,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert vulnerability
        result = await self.db["vulnerabilities"].insert_one(vuln_dict)
        vuln_dict["_id"] = result.inserted_id

        # Update vulnerability counts
        await self.db["scans"].update_one(
            {"_id": scan_id},
            {
                "$inc": {f"vulnerability_counts.{severity}": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        return VulnerabilityInDB(**vuln_dict)

    def _determine_severity(self, output: str) -> VulnerabilitySeverity:
        """Determine vulnerability severity based on output."""
        output = output.lower()
        if "critical" in output or "high risk" in output:
            return VulnerabilitySeverity.CRITICAL
        elif "high" in output:
            return VulnerabilitySeverity.HIGH
        elif "medium" in output:
            return VulnerabilitySeverity.MEDIUM
        elif "low" in output:
            return VulnerabilitySeverity.LOW
        return VulnerabilitySeverity.INFO

    async def _update_scan_progress(self, scan_id: PyObjectId, progress: float) -> None:
        """Update scan progress."""
        await self.db["scans"].update_one(
            {"_id": scan_id},
            {
                "$set": {
                    "progress": progress,
                    "updated_at": datetime.utcnow()
                }
            }
        )

    async def get_scan(self, scan_id: str) -> Optional[ScanInDB]:
        """Get scan by ID."""
        if not ObjectId.is_valid(scan_id):
            return None
        scan_dict = await self.db["scans"].find_one({"_id": ObjectId(scan_id)})
        return ScanInDB(**scan_dict) if scan_dict else None

    async def get_scan_vulnerabilities(
        self,
        scan_id: str,
        severity: Optional[VulnerabilitySeverity] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[VulnerabilityInDB]:
        """Get vulnerabilities for a scan."""
        query = {"scan_id": ObjectId(scan_id)}
        if severity:
            query["severity"] = severity

        cursor = self.db["vulnerabilities"].find(query).skip(skip).limit(limit)
        vulnerabilities = await cursor.to_list(length=limit)
        return [VulnerabilityInDB(**v) for v in vulnerabilities]

    async def cancel_scan(self, scan_id: str) -> bool:
        """Cancel an active scan."""
        if scan_id in self.active_scans:
            self.active_scans[scan_id].cancel()
            await self.db["scans"].update_one(
                {"_id": ObjectId(scan_id)},
                {
                    "$set": {
                        "status": ScanStatus.CANCELLED,
                        "end_time": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return True
        return False

    async def get_scan_progress(self, scan_id: str) -> Optional[float]:
        """Get scan progress."""
        scan = await self.get_scan(scan_id)
        return scan.progress if scan else None

    async def cleanup(self) -> None:
        """Cleanup scanner resources."""
        for task in self.active_scans.values():
            task.cancel()
        await asyncio.gather(*self.active_scans.values(), return_exceptions=True)
        self.active_scans.clear() 

    async def start_scan(self, db: AsyncIOMotorDatabase, user_id: str, config: Any) -> ObjectId:
        """Start a simple network scan based on ScanConfig and return scan id."""
        # Prepare scan document
        scan_doc: Dict[str, Any] = {
            "user_id": ObjectId(user_id),
            "status": ScanStatus.PENDING,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "scan_type": "network",
            "target": config.networkTarget if hasattr(config, "networkTarget") else "local",
            "output_dir": getattr(config, "outputDirectory", None),
            "useCustomPasswordList": getattr(config, "useCustomPasswordList", False),
        }

        result = await db["scans"].insert_one(scan_doc)
        scan_id = result.inserted_id

        async def get_local_cidr() -> str:
            try:
                proc = await asyncio.create_subprocess_shell(
                    "ip -o -f inet addr show | awk '{print $4}'",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, _ = await proc.communicate()
                cidrs = stdout.decode().strip().splitlines()
                private_patterns = [r"^10\.", r"^192\.168\.", r"^172\.(1[6-9]|2[0-9]|3[0-1])\."]
                for cidr in cidrs:
                    if cidr.startswith("127."):
                        continue
                    if any(re.match(p, cidr.split('/')[0]) for p in private_patterns):
                        return cidr
                for cidr in cidrs:
                    if not cidr.startswith("127."):
                        return cidr
            except Exception:
                pass
            return "192.168.1.0/24"

        async def run_ping_sweep(cidr: str) -> int:
            configured = getattr(settings, "NMAP_PATH", None)
            nmap_exec = None
            if configured and os.path.isabs(configured) and os.path.exists(configured):
                nmap_exec = configured
            else:
                nmap_exec = shutil.which(configured or "nmap")
            if not nmap_exec:
                return 0
            cmd = f"{nmap_exec} -sn -n {cidr}"
            proc = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await proc.communicate()
            if proc.returncode != 0:
                return 0
            # Count hosts from output lines
            lines = stdout.decode().splitlines()
            count = sum(1 for line in lines if line.startswith("Nmap scan report for"))
            return count

        async def perform():
            try:
                await db["scans"].update_one(
                    {"_id": scan_id},
                    {"$set": {"status": ScanStatus.IN_PROGRESS, "start_time": datetime.utcnow(), "updated_at": datetime.utcnow()}}
                )
                cidr = await get_local_cidr()
                total_hosts = await run_ping_sweep(cidr)
                await db["scans"].update_one(
                    {"_id": scan_id},
                    {"$set": {"status": ScanStatus.COMPLETED, "end_time": datetime.utcnow(), "total_hosts": total_hosts, "updated_at": datetime.utcnow()}}
                )
            except Exception as e:
                await db["scans"].update_one(
                    {"_id": scan_id},
                    {"$set": {"status": ScanStatus.FAILED, "end_time": datetime.utcnow(), "error_message": str(e), "updated_at": datetime.utcnow()}}
                )

        self.active_scans[str(scan_id)] = asyncio.create_task(perform())
        return scan_id