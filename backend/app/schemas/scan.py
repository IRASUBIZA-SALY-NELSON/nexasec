from pydantic import BaseModel
from enum import Enum
from typing import Optional, List
from fastapi import UploadFile

class ScanType(str, Enum):
    network = "network"
    web = "web"
    full = "full"

class ScanConfig(BaseModel):
    networkTarget: str
    outputDirectory: str
    scanType: ScanType
    useCustomPasswordList: bool
    customPasswordList: Optional[UploadFile] = None

class ScanResponse(BaseModel):
    scanId: str
    status: str
    message: str

class ScanStatus(BaseModel):
    scanId: str
    status: str  # pending, in_progress, completed, failed
    progress: float
    findings: List[dict] 