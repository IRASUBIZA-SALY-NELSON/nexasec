from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.core.database import get_database
from app.services.auth import get_current_user
from app.models.user import UserInDB
from app.services.advanced_scanner import AdvancedScanner, ScanType
import asyncio
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Global scanner instance
scanner = AdvancedScanner()

class ScanRequest(BaseModel):
    target: str
    scan_type: str
    credentials: Optional[Dict[str, str]] = None

class ScanResponse(BaseModel):
    scan_id: str
    status: str
    message: str

@router.post("/start", response_model=ScanResponse, summary="Start advanced scan", tags=["Advanced Scan"])
async def start_advanced_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """Start an advanced security scan on the target"""
    try:
        # Validate scan type
        try:
            scan_type = ScanType(scan_request.scan_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scan type. Must be one of: {[t.value for t in ScanType]}"
            )
        
        # Validate target
        if not scan_request.target:
            raise HTTPException(status_code=400, detail="Target is required")
        
        # Start scan
        scan_id = await scanner.start_scan(
            target=scan_request.target,
            scan_type=scan_type,
            credentials=scan_request.credentials
        )
        
        logger.info(f"Started {scan_type.value} scan on {scan_request.target} with ID {scan_id}")
        
        return {
            "scan_id": scan_id,
            "status": "started",
            "message": f"Advanced {scan_type.value} scan started successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to start scan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start scan: {str(e)}")

@router.get("/{scan_id}/status", summary="Get scan status", tags=["Advanced Scan"])
async def get_scan_status(
    scan_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get the status of a running scan"""
    try:
        scan_result = await scanner.get_scan_status(scan_id)
        
        if not scan_result:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return {
            "scan_id": scan_id,
            "status": scan_result.status,
            "progress": scan_result.progress,
            "target": scan_result.target,
            "scan_type": scan_result.scan_type.value,
            "start_time": scan_result.start_time.isoformat(),
            "end_time": scan_result.end_time.isoformat() if scan_result.end_time else None,
            "services_found": len(scan_result.services) if scan_result.services else 0,
            "vulnerabilities_found": len(scan_result.vulnerabilities) if scan_result.vulnerabilities else 0,
            "open_ports": len(scan_result.open_ports) if scan_result.open_ports else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get scan status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get scan status: {str(e)}")

@router.get("/{scan_id}/results", summary="Get scan results", tags=["Advanced Scan"])
async def get_scan_results(
    scan_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed results of a completed scan"""
    try:
        scan_result = await scanner.get_scan_status(scan_id)
        
        if not scan_result:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        if scan_result.status == "running":
            raise HTTPException(status_code=202, detail="Scan is still running")
        
        if scan_result.status == "failed":
            raise HTTPException(status_code=500, detail="Scan failed")
        
        # Format services
        services = []
        if scan_result.services:
            for service in scan_result.services:
                services.append({
                    "name": service.name,
                    "port": service.port,
                    "protocol": service.protocol,
                    "version": service.version,
                    "banner": service.banner,
                    "state": service.state,
                    "vulnerabilities": len(service.vulnerabilities) if service.vulnerabilities else 0
                })
        
        # Format vulnerabilities
        vulnerabilities = []
        if scan_result.vulnerabilities:
            for vuln in scan_result.vulnerabilities:
                vulnerabilities.append({
                    "id": vuln.id,
                    "title": vuln.title,
                    "description": vuln.description,
                    "severity": vuln.severity,
                    "cve": vuln.cve,
                    "port": vuln.port,
                    "service": vuln.service,
                    "remediation": vuln.remediation,
                    "exploit_available": vuln.exploit_available,
                    "risk_score": vuln.risk_score
                })
        
        # Calculate risk score
        total_risk = sum(vuln.risk_score for vuln in scan_result.vulnerabilities) if scan_result.vulnerabilities else 0
        max_risk = len(scan_result.vulnerabilities) * 100 if scan_result.vulnerabilities else 0
        overall_risk = (total_risk / max_risk * 100) if max_risk > 0 else 0
        
        return {
            "scan_id": scan_id,
            "target": scan_result.target,
            "scan_type": scan_result.scan_type.value,
            "status": scan_result.status,
            "start_time": scan_result.start_time.isoformat(),
            "end_time": scan_result.end_time.isoformat() if scan_result.end_time else None,
            "duration": (scan_result.end_time - scan_result.start_time).total_seconds() if scan_result.end_time else None,
            "summary": {
                "total_services": len(services),
                "total_vulnerabilities": len(vulnerabilities),
                "open_ports": len(scan_result.open_ports) if scan_result.open_ports else 0,
                "filtered_ports": len(scan_result.filtered_ports) if scan_result.filtered_ports else 0,
                "overall_risk_score": round(overall_risk, 2),
                "critical_vulnerabilities": len([v for v in vulnerabilities if v["severity"] == "critical"]),
                "high_vulnerabilities": len([v for v in vulnerabilities if v["severity"] == "high"]),
                "medium_vulnerabilities": len([v for v in vulnerabilities if v["severity"] == "medium"]),
                "low_vulnerabilities": len([v for v in vulnerabilities if v["severity"] == "low"])
            },
            "services": services,
            "vulnerabilities": vulnerabilities,
            "open_ports": scan_result.open_ports or [],
            "os_info": scan_result.os_info or {}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get scan results: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get scan results: {str(e)}")

@router.get("/", summary="List all scans", tags=["Advanced Scan"])
async def list_scans(
    current_user: UserInDB = Depends(get_current_user),
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
) -> Dict[str, Any]:
    """List all scans for the current user"""
    try:
        # Get all scans (in a real implementation, this would be stored in database)
        all_scans = []
        for scan_id, scan_result in scanner.scan_results.items():
            all_scans.append({
                "scan_id": scan_id,
                "target": scan_result.target,
                "scan_type": scan_result.scan_type.value,
                "status": scan_result.status,
                "progress": scan_result.progress,
                "start_time": scan_result.start_time.isoformat(),
                "end_time": scan_result.end_time.isoformat() if scan_result.end_time else None,
                "services_found": len(scan_result.services) if scan_result.services else 0,
                "vulnerabilities_found": len(scan_result.vulnerabilities) if scan_result.vulnerabilities else 0
            })
        
        # Apply filters
        if status:
            all_scans = [scan for scan in all_scans if scan["status"] == status]
        
        # Apply pagination
        total = len(all_scans)
        scans = all_scans[offset:offset + limit]
        
        return {
            "scans": scans,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
        
    except Exception as e:
        logger.error(f"Failed to list scans: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list scans: {str(e)}")

@router.delete("/{scan_id}", summary="Cancel scan", tags=["Advanced Scan"])
async def cancel_scan(
    scan_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """Cancel a running scan"""
    try:
        scan_result = await scanner.get_scan_status(scan_id)
        
        if not scan_result:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        if scan_result.status != "running":
            raise HTTPException(status_code=400, detail="Scan is not running")
        
        # Cancel the scan task
        if scan_id in scanner.active_scans:
            scanner.active_scans[scan_id].cancel()
            del scanner.active_scans[scan_id]
        
        # Update scan status
        scan_result.status = "cancelled"
        scan_result.end_time = datetime.now()
        
        return {
            "scan_id": scan_id,
            "status": "cancelled",
            "message": "Scan cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel scan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel scan: {str(e)}")

@router.get("/types", summary="Get available scan types", tags=["Advanced Scan"])
async def get_scan_types(
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get list of available scan types"""
    scan_types = []
    
    for scan_type in ScanType:
        scan_types.append({
            "value": scan_type.value,
            "name": scan_type.value.replace("_", " ").title(),
            "description": _get_scan_type_description(scan_type),
            "estimated_duration": _get_scan_type_duration(scan_type),
            "requires_credentials": scan_type in [ScanType.PASSWORD_AUDIT]
        })
    
    return {
        "scan_types": scan_types
    }

def _get_scan_type_description(scan_type: ScanType) -> str:
    """Get description for scan type"""
    descriptions = {
        ScanType.QUICK: "Fast port scan with basic service detection",
        ScanType.STANDARD: "Comprehensive port scan with service detection and OS fingerprinting",
        ScanType.COMPREHENSIVE: "Full vulnerability scan with all available checks",
        ScanType.WEB_APP: "Web application specific vulnerability scan",
        ScanType.SMB_VULNERABILITY: "SMB protocol vulnerability assessment",
        ScanType.PASSWORD_AUDIT: "Password strength and authentication testing"
    }
    return descriptions.get(scan_type, "Advanced security scan")

def _get_scan_type_duration(scan_type: ScanType) -> str:
    """Get estimated duration for scan type"""
    durations = {
        ScanType.QUICK: "1-2 minutes",
        ScanType.STANDARD: "5-10 minutes",
        ScanType.COMPREHENSIVE: "15-30 minutes",
        ScanType.WEB_APP: "5-15 minutes",
        ScanType.SMB_VULNERABILITY: "2-5 minutes",
        ScanType.PASSWORD_AUDIT: "3-10 minutes"
    }
    return durations.get(scan_type, "5-15 minutes")
