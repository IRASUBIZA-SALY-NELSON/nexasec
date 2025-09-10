from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database, get_db
from app.services.auth import get_current_user
from app.services.report import ReportGenerator
from app.models.user import UserInDB
from app.models.report import Report, ReportTemplate, ReportType, ReportFormat
from app.models.scan import Scan
from app.models.pentest import PenetrationTest
from pydantic import BaseModel, validator
from datetime import datetime
import os

router = APIRouter()

class ReportCreate(BaseModel):
    title: str
    report_type: ReportType
    format: ReportFormat
    scan_id: Optional[int] = None
    pentest_id: Optional[int] = None
    template_id: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None
    include_remediation: bool = True
    include_technical_details: bool = True
    include_evidence: bool = True
    password_protected: bool = False
    access_level: str = "private"

    @validator("title")
    def validate_title(cls, v):
        """Validate report title."""
        if not v or len(v) < 3 or len(v) > 100:
            raise ValueError("Title must be between 3 and 100 characters")
        return v

    @validator("scan_id", "pentest_id")
    def validate_source(cls, v, values):
        """Validate that either scan_id or pentest_id is provided based on report type."""
        report_type = values.get("report_type")
        if report_type == ReportType.SCAN and not values.get("scan_id"):
            raise ValueError("scan_id is required for scan reports")
        elif report_type == ReportType.PENTEST and not values.get("pentest_id"):
            raise ValueError("pentest_id is required for pentest reports")
        return v

class ReportTemplateCreate(BaseModel):
    name: str
    description: str
    report_type: ReportType
    format: ReportFormat
    header_template: str
    footer_template: str
    section_templates: List[Dict[str, Any]]
    style_config: Dict[str, Any]
    variables: Dict[str, Any]
    placeholders: Dict[str, Any]
    is_public: bool = False

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: ReportType
    format: ReportFormat
    generated_at: Optional[datetime]
    file_path: Optional[str]
    file_size: Optional[int]
    access_level: str
    summary: Optional[Dict[str, Any]]

class ReportTemplateResponse(BaseModel):
    id: int
    name: str
    description: str
    report_type: ReportType
    format: ReportFormat
    is_public: bool
    created_by: str
    version: str

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    *,
    report_in: ReportCreate,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Generate a new report.
    """
    # Validate source data exists and belongs to user
    if report_in.scan_id:
        scan = (
            db.query(Scan)
            .filter(
                Scan.id == report_in.scan_id,
                Scan.user_id == current_user.id
            )
            .first()
        )
        if not scan:
            raise HTTPException(
                status_code=404,
                detail="Scan not found"
            )
    elif report_in.pentest_id:
        pentest = (
            db.query(PenetrationTest)
            .filter(
                PenetrationTest.id == report_in.pentest_id,
                PenetrationTest.user_id == current_user.id
            )
            .first()
        )
        if not pentest:
            raise HTTPException(
                status_code=404,
                detail="Penetration test not found"
            )

    # Create generator instance with db
    report_generator = ReportGenerator(db)

    # Create report record
    report = Report(
        title=report_in.title,
        report_type=report_in.report_type,
        format=report_in.format,
        scan_id=report_in.scan_id,
        pentest_id=report_in.pentest_id,
        template_id=report_in.template_id,
        custom_fields=report_in.custom_fields,
        include_remediation=report_in.include_remediation,
        include_technical_details=report_in.include_technical_details,
        include_evidence=report_in.include_evidence,
        password_protected=report_in.password_protected,
        access_level=report_in.access_level,
        user_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Generate report in background
    if report_in.report_type == ReportType.SCAN:
        background_tasks.add_task(
            report_generator.generate_scan_report,
            db=db,
            scan=scan,
            report_format=report_in.format,
            template_id=report_in.template_id
        )
    else:
        background_tasks.add_task(
            report_generator.generate_pentest_report,
            db=db,
            pentest=pentest,
            report_format=report_in.format,
            template_id=report_in.template_id
        )

    return report

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get report by ID.
    """
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report

@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
   db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Download report file.
    """
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=404,
            detail="Report file not found"
        )

    return FileResponse(
        report.file_path,
        filename=f"{report.title}.{report.format.lower()}",
        media_type=f"application/{report.format.lower()}"
    )

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Delete report.
    """
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    # Delete report file if exists
    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}

@router.get("/")
async def list_reports(
    skip: int = 0,
    limit: int = 10,
    report_type: Optional[ReportType] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    List user's reports. Placeholder returns empty array to avoid 500s until SQL layer is wired.
    """
    return []

@router.post("/templates", response_model=ReportTemplateResponse)
async def create_template(
    *,
    template_in: ReportTemplateCreate,
   db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Create new report template.
    """
    template = ReportTemplate(
        **template_in.dict(),
        created_by=current_user.full_name,
        version="1.0"
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    return template

@router.get("/templates/{template_id}", response_model=ReportTemplateResponse)
async def get_template(
    template_id: int,
  db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get report template by ID.
    """
    template = db.query(ReportTemplate).filter(ReportTemplate.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )

    # Check access permissions
    if not template.is_public and template.created_by != current_user.full_name:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this template"
        )

    return template

@router.get("/templates", response_model=List[ReportTemplateResponse])
async def list_templates(
    skip: int = 0,
    limit: int = 10,
    report_type: Optional[ReportType] = None,
    format: Optional[ReportFormat] = None,
   db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    List available report templates.
    """
    query = db.query(ReportTemplate).filter(
        (ReportTemplate.is_public == True) | 
        (ReportTemplate.created_by == current_user.full_name)
    )

    if report_type:
        query = query.filter(ReportTemplate.report_type == report_type)
    if format:
        query = query.filter(ReportTemplate.format == format)

    return query.offset(skip).limit(limit).all()

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Delete report template.
    """
    template = db.query(ReportTemplate).filter(ReportTemplate.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )

    # Check ownership
    if template.created_by != current_user.full_name:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this template"
        )

    db.delete(template)
    db.commit()

    return {"message": "Template deleted successfully"} 