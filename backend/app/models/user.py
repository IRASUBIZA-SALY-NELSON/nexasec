from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum
from app.models.base import MongoBaseModel, PyObjectId

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    ANALYST = "analyst"
    PENTESTER = "pentester"

class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER
    subscription: SubscriptionTier = SubscriptionTier.FREE

class UserCreate(UserBase):
    password: str
    api_key: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(MongoBaseModel, UserBase):
    hashed_password: str
    api_key: str
    last_login: Optional[datetime] = None
    scan_count: int = 0
    pentest_count: int = 0

    class Collection:
        name = "users"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    created_at: datetime
    last_login: Optional[datetime]
    scan_count: int
    pentest_count: int

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str  # user id
    exp: datetime
    type: str  # "access" or "refresh"

class RefreshToken(MongoBaseModel):
    user_id: PyObjectId
    token: str
    expires_at: datetime
    is_blacklisted: bool = False

    class Collection:
        name = "refresh_tokens" 