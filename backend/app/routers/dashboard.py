from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, case
from typing import Any, Dict, List, Optional
from app.core.database import get_db, get_database
from app.services.auth import get_current_user
from app.models.user import UserInDB
from app.models.scan import (
    ScanStatus, 
    VulnerabilitySeverity,
    ScanInDB,
    VulnerabilityInDB,
    Scan
)
from app.models.pentest import (
    PentestStatus,
    FindingSeverity,
    FindingStatus,
    PentestInDB,
    FindingInDB,
    PenetrationTest
)
from datetime import datetime, timedelta
from bson import ObjectId
import calendar
from app.models.vulnerability import Vulnerability
from app.models.pentest import PentestFinding

router = APIRouter()

@router.get("/overview")
async def get_overview(
    db = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get overview statistics for the dashboard.
    """
    # Get counts for different entities
    total_scans = await db["scans"].count_documents({"user_id": ObjectId(current_user.id)})
    total_pentests = await db["pentests"].count_documents({"user_id": ObjectId(current_user.id)})
    
    # Get vulnerability statistics
    vulnerability_pipeline = [
        {"$match": {"user_id": ObjectId(current_user.id)}},
        {"$lookup": {
            "from": "vulnerabilities",
            "localField": "_id",
            "foreignField": "scan_id",
            "as": "vulnerabilities"
        }},
        {"$unwind": "$vulnerabilities"},
        {"$group": {
            "_id": "$vulnerabilities.severity",
            "count": {"$sum": 1}
        }}
    ]
    vulnerability_stats = await db["scans"].aggregate(vulnerability_pipeline).to_list(None)
    
    # Get finding statistics
    finding_pipeline = [
        {"$match": {"user_id": ObjectId(current_user.id)}},
        {"$lookup": {
            "from": "findings",
            "localField": "_id",
            "foreignField": "pentest_id",
            "as": "findings"
        }},
        {"$unwind": "$findings"},
        {"$group": {
            "_id": "$findings.severity",
            "count": {"$sum": 1}
        }}
    ]
    finding_stats = await db["pentests"].aggregate(finding_pipeline).to_list(None)
    
    # Get active scans and tests
    active_scans = await db["scans"].count_documents({
        "user_id": ObjectId(current_user.id),
        "status": ScanStatus.IN_PROGRESS
    })
    
    active_pentests = await db["pentests"].count_documents({
        "user_id": ObjectId(current_user.id),
        "status": PentestStatus.IN_PROGRESS
    })
    
    return {
        "total_scans": total_scans,
        "total_pentests": total_pentests,
        "active_scans": active_scans,
        "active_pentests": active_pentests,
        "vulnerability_statistics": {
            stat["_id"]: stat["count"] for stat in vulnerability_stats
        },
        "finding_statistics": {
            stat["_id"]: stat["count"] for stat in finding_stats
        }
    }

@router.get("/trends")
async def get_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get trend data for vulnerabilities and findings.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get daily vulnerability counts
    vulnerability_trends = (
        db.query(
            func.date(Vulnerability.created_at).label("date"),
            Vulnerability.severity,
            func.count(Vulnerability.id).label("count")
        )
        .join(Scan)
        .filter(
            Scan.user_id == current_user.id,
            Vulnerability.created_at >= start_date
        )
        .group_by(
            func.date(Vulnerability.created_at),
            Vulnerability.severity
        )
        .order_by("date")
        .all()
    )
    
    # Get daily finding counts
    finding_trends = (
        db.query(
            func.date(PentestFinding.created_at).label("date"),
            PentestFinding.severity,
            func.count(PentestFinding.id).label("count")
        )
        .join(PenetrationTest)
        .filter(
            PenetrationTest.user_id == current_user.id,
            PentestFinding.created_at >= start_date
        )
        .group_by(
            func.date(PentestFinding.created_at),
            PentestFinding.severity
        )
        .order_by("date")
        .all()
    )
    
    return {
        "vulnerability_trends": [
            {
                "date": date.isoformat(),
                "severity": severity.value,
                "count": count
            }
            for date, severity, count in vulnerability_trends
        ],
        "finding_trends": [
            {
                "date": date.isoformat(),
                "severity": severity.value,
                "count": count
            }
            for date, severity, count in finding_trends
        ]
    }

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get recent activity across all entities.
    """
    # Get recent scans
    recent_scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(desc(Scan.created_at))
        .limit(limit)
        .all()
    )
    
    # Get recent pentests
    recent_pentests = (
        db.query(PenetrationTest)
        .filter(PenetrationTest.user_id == current_user.id)
        .order_by(desc(PenetrationTest.created_at))
        .limit(limit)
        .all()
    )
    
    # Get recent vulnerabilities
    recent_vulnerabilities = (
        db.query(Vulnerability)
        .join(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(desc(Vulnerability.created_at))
        .limit(limit)
        .all()
    )
    
    # Get recent findings
    recent_findings = (
        db.query(PentestFinding)
        .join(PenetrationTest)
        .filter(PenetrationTest.user_id == current_user.id)
        .order_by(desc(PentestFinding.created_at))
        .limit(limit)
        .all()
    )
    
    return {
        "recent_scans": [
            {
                "id": scan.id,
                "target": scan.target,
                "status": scan.status,
                "created_at": scan.created_at
            }
            for scan in recent_scans
        ],
        "recent_pentests": [
            {
                "id": pentest.id,
                "name": pentest.name,
                "status": pentest.status,
                "created_at": pentest.created_at
            }
            for pentest in recent_pentests
        ],
        "recent_vulnerabilities": [
            {
                "id": vuln.id,
                "name": vuln.name,
                "severity": vuln.severity,
                "created_at": vuln.created_at
            }
            for vuln in recent_vulnerabilities
        ],
        "recent_findings": [
            {
                "id": finding.id,
                "title": finding.title,
                "severity": finding.severity,
                "created_at": finding.created_at
            }
            for finding in recent_findings
        ]
    }

@router.get("/monthly-summary")
async def get_monthly_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get monthly summary of security activities.
    """
    if not year:
        year = datetime.utcnow().year
    if not month:
        month = datetime.utcnow().month
    
    start_date = datetime(year, month, 1)
    _, last_day = calendar.monthrange(year, month)
    end_date = datetime(year, month, last_day, 23, 59, 59)
    
    # Get monthly scan statistics
    scan_stats = (
        db.query(
            func.count(Scan.id).label("total"),
            func.sum(case([(Scan.status == ScanStatus.COMPLETED, 1)], else_=0)).label("completed"),
            func.sum(case([(Scan.status == ScanStatus.FAILED, 1)], else_=0)).label("failed")
        )
        .filter(
            Scan.user_id == current_user.id,
            Scan.created_at.between(start_date, end_date)
        )
        .first()
    )
    
    # Get monthly pentest statistics
    pentest_stats = (
        db.query(
            func.count(PenetrationTest.id).label("total"),
            func.sum(case([(PenetrationTest.status == PentestStatus.COMPLETED, 1)], else_=0)).label("completed"),
            func.sum(case([(PenetrationTest.status == PentestStatus.FAILED, 1)], else_=0)).label("failed")
        )
        .filter(
            PenetrationTest.user_id == current_user.id,
            PenetrationTest.created_at.between(start_date, end_date)
        )
        .first()
    )
    
    # Get vulnerability severity distribution
    vulnerability_distribution = (
        db.query(
            Vulnerability.severity,
            func.count(Vulnerability.id).label("count")
        )
        .join(Scan)
        .filter(
            Scan.user_id == current_user.id,
            Vulnerability.created_at.between(start_date, end_date)
        )
        .group_by(Vulnerability.severity)
        .all()
    )
    
    # Get finding severity distribution
    finding_distribution = (
        db.query(
            PentestFinding.severity,
            func.count(PentestFinding.id).label("count")
        )
        .join(PenetrationTest)
        .filter(
            PenetrationTest.user_id == current_user.id,
            PentestFinding.created_at.between(start_date, end_date)
        )
        .group_by(PentestFinding.severity)
        .all()
    )
    
    return {
        "period": {
            "year": year,
            "month": month
        },
        "scan_statistics": {
            "total": scan_stats.total or 0,
            "completed": scan_stats.completed or 0,
            "failed": scan_stats.failed or 0,
            "success_rate": (scan_stats.completed / scan_stats.total * 100) if scan_stats.total else 0
        },
        "pentest_statistics": {
            "total": pentest_stats.total or 0,
            "completed": pentest_stats.completed or 0,
            "failed": pentest_stats.failed or 0,
            "success_rate": (pentest_stats.completed / pentest_stats.total * 100) if pentest_stats.total else 0
        },
        "vulnerability_distribution": {
            severity.value: count for severity, count in vulnerability_distribution
        },
        "finding_distribution": {
            severity.value: count for severity, count in finding_distribution
        }
    }

@router.get("/security-score")
async def get_security_score(
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Calculate security score based on vulnerabilities and findings.
    """
    # Get vulnerability counts by severity
    vulnerability_counts = dict(
        db.query(
            Vulnerability.severity,
            func.count(Vulnerability.id)
        )
        .join(Scan)
        .filter(Scan.user_id == current_user.id)
        .group_by(Vulnerability.severity)
        .all()
    )
    
    # Get finding counts by severity
    finding_counts = dict(
        db.query(
            PentestFinding.severity,
            func.count(PentestFinding.id)
        )
        .join(PenetrationTest)
        .filter(PenetrationTest.user_id == current_user.id)
        .group_by(PentestFinding.severity)
        .all()
    )
    
    # Calculate score (lower is better)
    score = 100
    
    # Deduct points for vulnerabilities
    score -= (vulnerability_counts.get(VulnerabilitySeverity.CRITICAL, 0) * 10)
    score -= (vulnerability_counts.get(VulnerabilitySeverity.HIGH, 0) * 7)
    score -= (vulnerability_counts.get(VulnerabilitySeverity.MEDIUM, 0) * 4)
    score -= (vulnerability_counts.get(VulnerabilitySeverity.LOW, 0) * 2)
    
    # Deduct points for findings
    score -= (finding_counts.get(FindingSeverity.CRITICAL, 0) * 10)
    score -= (finding_counts.get(FindingSeverity.HIGH, 0) * 7)
    score -= (finding_counts.get(FindingSeverity.MEDIUM, 0) * 4)
    score -= (finding_counts.get(FindingSeverity.LOW, 0) * 2)
    
    # Ensure score doesn't go below 0
    score = max(0, score)
    
    # Determine risk level
    risk_level = "Critical" if score < 40 else "High" if score < 60 else "Medium" if score < 80 else "Low"
    
    return {
        "security_score": score,
        "risk_level": risk_level,
        "vulnerability_counts": {
            severity.value: count for severity, count in vulnerability_counts.items()
        },
        "finding_counts": {
            severity.value: count for severity, count in finding_counts.items()
        },
        "recommendations": [
            "Address critical vulnerabilities immediately",
            "Implement security controls for high-risk findings",
            "Schedule regular security assessments",
            "Update security policies and procedures"
        ] if score < 80 else [
            "Maintain current security posture",
            "Continue regular monitoring",
            "Plan for future security improvements"
        ]
    }

@router.get("/system-health")
async def get_system_health(
    db = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get system health data for the dashboard.
    """
    # You can customize this with real data from your system
    return {
        "server_status": "Online",
        "security": "96%",
        "uptime": "99.8%"
    }

@router.get("/alerts")
async def get_alerts(
    db = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get recent security alerts.
    """
    # In a real implementation, you would fetch this from your database
    return [
        {
            "type": "Port Scan",
            "source": "192.168.1.105",
            "severity": "high"
        },
        {
            "type": "Login Attempt",
            "source": "10.0.0.15",
            "severity": "medium"
        }
    ]

@router.get("/threat-data")
async def get_threat_data(
    db = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get threat activity data for dashboard charts.
    """
    # Sample threat data - in a real app, you would query your database
    return [
        {"date": "2023-01", "attacks": 45, "vulnerabilities": 12},
        {"date": "2023-02", "attacks": 52, "vulnerabilities": 15},
        {"date": "2023-03", "attacks": 38, "vulnerabilities": 10},
        {"date": "2023-04", "attacks": 65, "vulnerabilities": 18},
        {"date": "2023-05", "attacks": 48, "vulnerabilities": 13},
        {"date": "2023-06", "attacks": 59, "vulnerabilities": 21},
        {"date": "2023-07", "attacks": 72, "vulnerabilities": 25},
        {"date": "2023-08", "attacks": 63, "vulnerabilities": 19},
        {"date": "2023-09", "attacks": 55, "vulnerabilities": 16},
        {"date": "2023-10", "attacks": 67, "vulnerabilities": 22},
        {"date": "2023-11", "attacks": 78, "vulnerabilities": 28},
        {"date": "2023-12", "attacks": 83, "vulnerabilities": 31}
    ] 