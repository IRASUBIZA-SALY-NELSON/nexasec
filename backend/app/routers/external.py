from fastapi import APIRouter, Depends, HTTPException
from typing import Any, Dict, Optional
import httpx
import os

from app.services.auth import get_current_user
from app.models.user import UserInDB

router = APIRouter()

SHODAN_API_KEY = os.getenv("SHODAN_API_KEY", "")

@router.get("/whois", summary="WHOIS via RDAP")
async def whois(query: str, current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    # Use RDAP for IPs and domains
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            # Try IP RDAP first
            ip_resp = await client.get(f"https://rdap.apnic.net/ip/{query}")
            if ip_resp.status_code == 200:
                return ip_resp.json()
            # Try domain RDAP
            dom_resp = await client.get(f"https://rdap.verisign.com/com/v1/domain/{query}")
            if dom_resp.status_code == 200:
                return dom_resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"RDAP lookup failed: {str(e)}")
    raise HTTPException(status_code=404, detail="No RDAP data found")


@router.get("/shodan", summary="Shodan host lookup")
async def shodan_host(ip: str, current_user: UserInDB = Depends(get_current_user)) -> Dict[str, Any]:
    if not SHODAN_API_KEY:
        raise HTTPException(status_code=400, detail="SHODAN_API_KEY not configured")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"https://api.shodan.io/shodan/host/{ip}?key={SHODAN_API_KEY}")
            if resp.status_code == 200:
                return resp.json()
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Shodan request failed: {str(e)}")


