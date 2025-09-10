from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Any, List, Optional, Dict
from datetime import datetime
import os
import re

from app.core.config import settings
from app.services.auth import get_current_user
from app.models.user import UserInDB

router = APIRouter()

# Log format used in logging.basicConfig:
# '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_LINE_REGEX = re.compile(r"^(?P<asctime>[^\s].*?)\s-\s(?P<logger>[^\s].*?)\s-\s(?P<levelname>\w+)\s-\s(?P<message>.*)$")


def parse_log_line(line: str) -> Optional[Dict[str, Any]]:
    match = LOG_LINE_REGEX.match(line.strip())
    if not match:
        return None
    data = match.groupdict()
    # Try to parse time
    try:
        # Default logging asctime format is '%Y-%m-%d %H:%M:%S,%f'
        timestamp = datetime.strptime(data["asctime"], "%Y-%m-%d %H:%M:%S,%f")
    except Exception:
        timestamp = None
    return {
        "time": data["asctime"],
        "timestamp": timestamp.isoformat() if timestamp else None,
        "logger": data["logger"],
        "level": data["levelname"],
        "message": data["message"],
    }


@router.get("/", summary="List system logs", tags=["Logs"])
async def list_system_logs(
    q: Optional[str] = Query(default=None, description="Search text"),
    level: Optional[str] = Query(default=None, description="Filter by level e.g. INFO, WARNING, ERROR"),
    logger_name: Optional[str] = Query(default=None, description="Filter by logger name"),
    start_time: Optional[str] = Query(default=None, description="ISO start time"),
    end_time: Optional[str] = Query(default=None, description="ISO end time"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=500),
    current_user: UserInDB = Depends(get_current_user),
) -> Any:
    """
    Read system log file and return structured log entries.
    Non-destructive: only reads the file; does not delete or rotate.
    """
    log_path = settings.LOG_FILE_PATH
    if not os.path.exists(log_path):
        raise HTTPException(status_code=404, detail="Log file not found")

    # Load file lines efficiently
    try:
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {str(e)}")

    # Parse lines
    entries: List[Dict[str, Any]] = []
    for line in lines:
        parsed = parse_log_line(line)
        if parsed:
            entries.append(parsed)

    # Apply filters
    def within_time(entry: Dict[str, Any]) -> bool:
        if not start_time and not end_time:
            return True
        try:
            if entry["timestamp"] is None:
                return False
            t = datetime.fromisoformat(entry["timestamp"])
            if start_time:
                if t < datetime.fromisoformat(start_time):
                    return False
            if end_time:
                if t > datetime.fromisoformat(end_time):
                    return False
            return True
        except Exception:
            return False

    if level:
        level_up = level.upper()
        entries = [e for e in entries if e.get("level", "").upper() == level_up]
    if logger_name:
        entries = [e for e in entries if e.get("logger", "") == logger_name]
    if q:
        q_lower = q.lower()
        entries = [e for e in entries if q_lower in (e.get("message", "").lower())]
    entries = [e for e in entries if within_time(e)]

    # Sort by time descending if timestamp available, otherwise keep file order
    entries.sort(key=lambda e: e.get("timestamp") or "", reverse=True)

    total = len(entries)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_items = entries[start_idx:end_idx]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": page_items,
    }


