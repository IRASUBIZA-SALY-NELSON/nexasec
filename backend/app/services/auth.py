from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core.config import settings
from app.models.user import UserInDB, UserCreate, TokenPayload, RefreshToken
from app.core.database import get_database
import secrets
import uuid
import logging
import time

# Configure logging
logger = logging.getLogger("auth")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Simple in-memory rate limiting
rate_limit_storage: Dict[str, Dict[str, Any]] = {}

def rate_limiter(identifier: str, max_requests: int = settings.RATE_LIMIT_REQUESTS, window: int = settings.RATE_LIMIT_WINDOW):
    """Basic rate limiter"""
    current_time = time.time()
    
    # Initialize or clean up old data
    if identifier not in rate_limit_storage or rate_limit_storage[identifier]["reset_at"] <= current_time:
        rate_limit_storage[identifier] = {
            "count": 0,
            "reset_at": current_time + window
        }
    
    # Increment count
    rate_limit_storage[identifier]["count"] += 1
    
    # Check if rate limit exceeded
    if rate_limit_storage[identifier]["count"] > max_requests:
        logger.warning(f"Rate limit exceeded for {identifier}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later."
        )

async def get_user(db: AsyncIOMotorDatabase, user_id: str) -> Optional[UserInDB]:
    """Get user by ID."""
    if not ObjectId.is_valid(user_id):
        logger.error(f"Invalid ObjectId format for user_id: {user_id}")
        return None
    user_dict = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user_dict:
        logger.info(f"Retrieved user: id={user_dict['_id']}, email={user_dict['email']}, role={user_dict.get('role', 'unknown')}")
    else:
        logger.warning(f"User not found with id: {user_id}")
    return UserInDB(**user_dict) if user_dict else None

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    """Get user by email."""
    user_dict = await db["users"].find_one({"email": email})
    if user_dict:
        logger.info(f"Retrieved user by email: id={user_dict['_id']}, email={email}, role={user_dict.get('role', 'unknown')}")
    else:
        logger.warning(f"User not found with email: {email}")
    return UserInDB(**user_dict) if user_dict else None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash. Return False on verification/backend errors instead of raising."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

def create_access_token(
    user_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    logger.info(f"Created access token for user_id={user_id}, expires at {expire}")
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    logger.info(f"Created refresh token for user_id={data.get('sub')}, expires at {expire}")
    return encoded_jwt

def generate_api_key() -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(32)

async def authenticate_user(db: AsyncIOMotorDatabase, username: str, password: str) -> Optional[dict]:
    """Authenticate user with email/username and password."""
    logger.info(f"Attempting to authenticate user: {username}")
    
    user_dict = await db["users"].find_one({"email": username})
    
    if not user_dict:
        logger.warning(f"Authentication failed: User not found with email {username}")
        return None
    
    # Ensure hashed_password exists and is a string
    hashed = user_dict.get("hashed_password")
    if not isinstance(hashed, str) or not hashed:
        logger.error(f"Authentication failed: Missing or invalid hashed_password for user {username}")
        return None

    if not verify_password(password, hashed):
        logger.warning(f"Authentication failed: Invalid password for user {username}")
        return None
    
    # Update last login time
    await db["users"].update_one(
        {"_id": user_dict["_id"]},
        {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )
    
    logger.info(f"User authenticated successfully: id={user_dict['_id']}, email={username}")
    return user_dict

async def create_user(db: AsyncIOMotorDatabase, user_create: UserCreate) -> UserInDB:
    """Create new user."""
    # Check if user exists
    if await get_user_by_email(db, user_create.email):
        logger.warning(f"User creation failed: Email already exists - {user_create.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user dict
    user_dict = user_create.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["api_key"] = generate_api_key()
    
    # Insert into database
    result = await db["users"].insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    logger.info(f"User created successfully: id={result.inserted_id}, email={user_create.email}, role={user_dict.get('role', 'unknown')}")
    return UserInDB(**user_dict)

async def create_refresh_token_db(
    db: AsyncIOMotorDatabase,
    user_id: str,
    token: str,
    expires_at: datetime
) -> None:
    """Store refresh token in database."""
    refresh_token = {
        "user_id": ObjectId(user_id),
        "token": token,
        "expires_at": expires_at,
        "is_blacklisted": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db["refresh_tokens"].insert_one(refresh_token)

async def get_refresh_token(
    db: AsyncIOMotorDatabase,
    token: str
) -> Optional[RefreshToken]:
    """Get refresh token from database."""
    token_dict = await db["refresh_tokens"].find_one({
        "token": token,
        "is_blacklisted": False,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    return RefreshToken(**token_dict) if token_dict else None

async def blacklist_refresh_token(
    db: AsyncIOMotorDatabase,
    token: str
) -> None:
    """Blacklist a refresh token."""
    await db["refresh_tokens"].update_one(
        {"token": token},
        {"$set": {"is_blacklisted": True, "updated_at": datetime.utcnow()}}
    )

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
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        token_type: str = payload.get("type")
        if token_type != "access":
            raise credentials_exception
            
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception
        
    # Get user from database
    user = await get_user(db, user_id)
    if user is None:
        logger.error(f"User not found: {user_id}")
        raise credentials_exception
        
    return user

async def update_user_login(
    db: AsyncIOMotorDatabase,
    user_id: str
) -> None:
    """Update user's last login time."""
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )

async def update_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
    update_data: dict
) -> Optional[UserInDB]:
    """Update user data."""
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db["users"].find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    return UserInDB(**result) if result else None

async def generate_new_api_key(
    db: AsyncIOMotorDatabase,
    user_id: str
) -> str:
    """Generate and update user's API key."""
    new_api_key = generate_api_key()
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "api_key": new_api_key,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return new_api_key

class RateLimiter:
    """Simple in-memory rate limiter."""
    def __init__(self):
        self._requests = {}
        self._tokens = {}
        
    def is_allowed(self, key: str, limit: int, window: int = 60) -> bool:
        """Check if request is allowed based on rate limit."""
        now = datetime.utcnow().timestamp()
        
        # Clean up old requests
        self._requests = {k: v for k, v in self._requests.items() 
                        if now - v[-1] < window}
        
        if key not in self._requests:
            self._requests[key] = []
            
        # Remove old requests outside the window
        self._requests[key] = [ts for ts in self._requests[key] 
                             if now - ts < window]
        
        # Check if under limit
        if len(self._requests[key]) < limit:
            self._requests[key].append(now)
            return True
            
        return False
        
    def add_token(self, token: str, user_id: int):
        """Add token to blacklist."""
        self._tokens[token] = {
            "user_id": user_id,
            "timestamp": datetime.utcnow()
        }
        
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        return token in self._tokens

# Create global rate limiter instance
rate_limiter = RateLimiter() 