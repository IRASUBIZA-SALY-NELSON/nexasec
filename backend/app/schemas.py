from enum import Enum
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ScanType(str, Enum):
    NETWORK = "network"
    WEB = "web"
    PENTEST = "pentest"

class ScanConfig(BaseModel):
    networkTarget: str
    outputDirectory: str
    scanType: ScanType
    useCustomPasswordList: bool = False

class ScanStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class ScanStatusSchema(BaseModel):
    status: ScanStatus
    progress: Optional[float] = None
    message: Optional[str] = None

# Add the missing report schemas
class ReportInDB(BaseModel):
    id: Optional[str] = None
    title: str
    report_type: str
    format: str
    scan_id: Optional[str] = None
    pentest_id: Optional[str] = None
    template_id: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None
    include_remediation: bool = True
    include_technical_details: bool = True
    include_evidence: bool = True
    password_protected: bool = False
    access_level: str = "private"
    user_id: str
    file_path: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
class ReportTemplateInDB(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    report_type: str
    format: str
    header_template: str
    footer_template: str
    section_templates: List[Dict[str, Any]]
    style_config: Dict[str, Any]
    variables: Dict[str, Any]
    placeholders: Dict[str, Any]
    is_public: bool = False
    created_by: str
    version: str = "1.0"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None