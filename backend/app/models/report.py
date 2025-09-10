from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.base import MongoBaseModel, PyObjectId

class ReportType(str, Enum):
    SCAN = "scan"
    PENTEST = "pentest"
    COMPLIANCE = "compliance"

class ReportFormat(str, Enum):
    PDF = "pdf"
    HTML = "html"
    DOCX = "docx"

class Report(BaseModel):
    id: str
    title: str
    report_type: str
    format: str
    scan_id: Optional[str] = None
    pentest_id: Optional[str] = None
    template_id: Optional[str] = None
    file_path: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    report_type: str
    format: str
    is_public: bool
    created_by: str
    version: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ReportStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"

class ReportTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: ReportType
    supported_formats: List[ReportFormat]
    template_data: Dict[str, Any]
    sections: List[str]
    is_default: bool = False

class ReportTemplateInDB(MongoBaseModel):
    user_id: Optional[PyObjectId] = None  # None for system templates
    name: str
    description: Optional[str] = None
    report_type: ReportType
    supported_formats: List[ReportFormat]
    template_data: Dict[str, Any]
    sections: List[str]
    is_default: bool = False
    version: str = "1.0.0"
    is_public: bool = False

    class Collection:
        name = "report_templates"

class ReportCreate(BaseModel):
    title: str
    description: Optional[str] = None
    report_type: ReportType
    format: ReportFormat
    template_id: Optional[str] = None
    source_id: str  # ID of scan or pentest
    include_executive_summary: bool = True
    include_technical_details: bool = True
    include_remediation_plan: bool = True
    custom_fields: Optional[Dict[str, Any]] = None

class ReportInDB(MongoBaseModel):
    user_id: PyObjectId
    title: str
    description: Optional[str] = None
    report_type: ReportType
    format: ReportFormat
    template_id: Optional[PyObjectId] = None
    source_id: PyObjectId
    status: ReportStatus = ReportStatus.PENDING
    file_path: Optional[str] = None
    file_hash: Optional[str] = None
    file_size: Optional[int] = None
    generation_time: Optional[float] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    custom_fields: Optional[Dict[str, Any]] = None
    include_executive_summary: bool = True
    include_technical_details: bool = True
    include_remediation_plan: bool = True

    class Collection:
        name = "reports"

class ReportTemplateResponse(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    description: Optional[str]
    report_type: ReportType
    supported_formats: List[ReportFormat]
    sections: List[str]
    is_default: bool
    version: str
    is_public: bool
    created_at: datetime
    updated_at: datetime

class ReportResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    report_type: ReportType
    format: ReportFormat
    template_id: Optional[str]
    source_id: str
    status: ReportStatus
    file_path: Optional[str]
    file_hash: Optional[str]
    file_size: Optional[int]
    generation_time: Optional[float]
    error_message: Optional[str]
    metadata: Dict[str, Any]
    custom_fields: Optional[Dict[str, Any]]
    include_executive_summary: bool
    include_technical_details: bool
    include_remediation_plan: bool
    created_at: datetime
    updated_at: datetime 