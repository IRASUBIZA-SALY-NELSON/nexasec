from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Any, Optional
from app.core.database import get_database
from app.services.auth import (
    authenticate_user, create_access_token, create_refresh_token,
    get_password_hash, generate_api_key, rate_limiter
)
from app.models.user import UserRole, SubscriptionTier, UserInDB
from pydantic import BaseModel, EmailStr
from datetime import timedelta, datetime
from jose import jwt, JWTError
from app.core.config import settings
from bson import ObjectId
import logging

# Configure logging
logger = logging.getLogger("auth_router")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_database)
) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_type: str = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise credentials_exception
    
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    
    return UserInDB(**user)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str = None
    exp: int = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str  # Frontend sends 'name' instead of 'full_name'
    company: Optional[str] = None  # Frontend sends 'company' instead of 'company_name'
    plan: Optional[str] = "basic"  # Frontend sends 'plan' instead of 'subscription_tier'

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: Optional[str] = None
    role: UserRole
    subscription_tier: SubscriptionTier
    api_key: Optional[str] = None
    is_active: bool

class LoginInput(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup", response_model=UserResponse)
async def signup(
    user_in: UserCreate,
    db = Depends(get_database)
) -> Any:
    """
    Create new user.
    """
    logger.info(f"Signup attempt for email: {user_in.email}")
    
    # Check if email already registered
    if await db["users"].find_one({"email": user_in.email}):
        logger.warning(f"Signup failed: Email already registered - {user_in.email}")
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Map plan string to SubscriptionTier enum
    plan_mapping = {
        "basic": SubscriptionTier.FREE,
        "professional": SubscriptionTier.PROFESSIONAL,
        "enterprise": SubscriptionTier.ENTERPRISE,
        "free": SubscriptionTier.FREE
    }
    
    subscription_tier = plan_mapping.get(user_in.plan.lower() if user_in.plan else "basic", SubscriptionTier.FREE)
    logger.info(f"Mapped plan '{user_in.plan}' to subscription tier '{subscription_tier}'")
    
    # Create new user
    user = {
        "email": user_in.email,
        "hashed_password": get_password_hash(user_in.password),
        "full_name": user_in.name,  # Map 'name' to 'full_name'
        "company_name": user_in.company,  # Map 'company' to 'company_name'
        "subscription_tier": subscription_tier,
        "role": UserRole.USER,
        "api_key": generate_api_key(),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "scan_count": 0,
        "pentest_count": 0
    }
    
    try:
        result = await db["users"].insert_one(user)
        user["id"] = str(result.inserted_id)
        logger.info(f"User created successfully: id={result.inserted_id}, email={user_in.email}")
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create user"
        )
    
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_database)
) -> Any:
    """
    OAuth2 compatible token login using form data.
    """
    # Rate limiting
    if not rate_limiter.is_allowed(f"login_{form_data.username}", 5):  # 5 attempts per minute
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later."
        )
    
    # Authenticate user
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access and refresh tokens
    access_token = create_access_token(
        user_id=str(user["_id"]),
        expires_delta=timedelta(minutes=30)
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"])}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: LoginInput,
    db = Depends(get_database)
) -> Any:
    """
    JSON-based login endpoint for frontend applications.
    """
    try:
        # Rate limiting
        if not rate_limiter.is_allowed(f"login_{login_data.email}", 5):  # 5 attempts per minute
            logger.warning(f"Rate limit exceeded for login attempt: {login_data.email}")
            raise HTTPException(
                status_code=429,
                detail="Too many login attempts. Please try again later."
            )
        
        # Authenticate user
        user = await authenticate_user(db, login_data.email, login_data.password)
        if not user:
            logger.warning(f"Failed login attempt for: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access and refresh tokens
        access_token = create_access_token(
            user_id=str(user["_id"]),
            expires_delta=timedelta(minutes=30)
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user["_id"])}
        )
        
        logger.info(f"Successful login for user: {login_data.email}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions (they'll be properly handled)
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get current user information.
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=getattr(current_user, 'company_name', None),
        role=current_user.role,
        subscription_tier=getattr(current_user, 'subscription_tier', current_user.subscription),
        api_key=current_user.api_key,
        is_active=current_user.is_active
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token: str,
    db = Depends(get_database)
) -> Any:
    """
    Refresh access token.
    """
    try:
        # Verify refresh token
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=400,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        # Check if token is blacklisted
        if rate_limiter.is_token_blacklisted(token):
            raise HTTPException(
                status_code=401,
                detail="Token has been invalidated"
            )
        
        # Get user
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=400,
                detail="Inactive user"
            )
        
        # Create new tokens
        access_token = create_access_token(
            user_id=str(user["_id"]),
            expires_delta=timedelta(minutes=30)
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user["_id"])}
        )
        
        # Blacklist old refresh token
        rate_limiter.add_token(token, user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(
    token: str,
    db = Depends(get_database)
) -> Any:
    """
    Logout user by blacklisting their refresh token.
    """
    try:
        # Verify token
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        # Blacklist token
        rate_limiter.add_token(token, user_id)
        
        return {"message": "Successfully logged out"}
        
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/api-key")
async def generate_new_api_key(
    current_user = Depends(get_current_user),
    db = Depends(get_database)
) -> Any:
    """
    Generate new API key for user.
    """
    # Generate new API key
    new_api_key = generate_api_key()
    
    # Update user's API key
    await db["users"].update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"api_key": new_api_key}}
    )
    
    return {"api_key": new_api_key}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """
    Get current user information.
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=getattr(current_user, 'company_name', None),
        role=current_user.role,
        subscription_tier=getattr(current_user, 'subscription_tier', current_user.subscription),
        api_key=current_user.api_key,
        is_active=current_user.is_active
    ) 