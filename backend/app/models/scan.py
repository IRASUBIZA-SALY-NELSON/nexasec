from enum import Enum
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ScanType(str, Enum):
    NETWORK = "network"
    WEB = "web"
    VULNERABILITY = "vulnerability"
    PORT = "port"

class VulnerabilitySeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class Scan(BaseModel):
    id: str
    name: str
    target: str
    scan_type: str
    status: ScanStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class ScanCreate(BaseModel):
    name: str
    target: str
    scan_type: str

class ScanInDB(Scan):
    pass

class VulnerabilityCreate(BaseModel):
    title: str
    description: str
    severity: VulnerabilitySeverity
    scan_id: str

class VulnerabilityInDB(BaseModel):
    id: str
    title: str
    description: str
    severity: VulnerabilitySeverity
    scan_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class ScanResponse(BaseModel):
    id: str
    name: str
    target: str
    scan_type: str
    status: ScanStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class VulnerabilityResponse(BaseModel):
    id: str
    title: str
    description: str
    severity: VulnerabilitySeverity
    scan_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None 