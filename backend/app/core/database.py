from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# MongoDB setup
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
database = mongo_client[settings.MONGODB_NAME]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_database():
    return database

# Initialize collections
def init_collections():
    db = mongo_client[settings.MONGODB_NAME]
    if "scans" not in db.list_collection_names():
        db.create_collection("scans")
    if "pentests" not in db.list_collection_names():
        db.create_collection("pentests")
    if "reports" not in db.list_collection_names():
        db.create_collection("reports")
    if "vulnerabilities" not in db.list_collection_names():
        db.create_collection("vulnerabilities")

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        # Test connection by listing collections
        collections = await database.list_collection_names()
        logger.info(f"Successfully connected to MongoDB. Available collections: {collections}")
        
        # Count documents in collections for verification
        for collection_name in COLLECTIONS.values():
            count = await database[collection_name].count_documents({})
            logger.info(f"Collection '{collection_name}' has {count} documents")
            
        return True
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        return False

async def close_mongo_connection():
    if mongo_client:
        logger.info("Closing MongoDB connection...")
        mongo_client.close()
        logger.info("MongoDB connection closed")

# Collection names for easy reference
COLLECTIONS = {
    "users": "users",
    "scans": "scans",
    "vulnerabilities": "vulnerabilities",
    "pentests": "pentests",
    "findings": "findings",
    "reports": "reports",
    "report_templates": "report_templates",
    "api_keys": "api_keys",
    "refresh_tokens": "refresh_tokens"
}

# Indexes to be created on startup
INDEXES = {
    "users": [
        [("email", 1)],  # Unique index on email
        [("username", 1)]  # Unique index on username
    ],
    "scans": [
        [("user_id", 1)],  # Index for user's scans
        [("created_at", -1)]  # Index for sorting by creation date
    ],
    "vulnerabilities": [
        [("scan_id", 1)],  # Index for scan's vulnerabilities
        [("severity", 1)]  # Index for filtering by severity
    ],
    "pentests": [
        [("user_id", 1)],  # Index for user's pentests
        [("created_at", -1)]  # Index for sorting by creation date
    ],
    "findings": [
        [("pentest_id", 1)],  # Index for pentest's findings
        [("severity", 1)]  # Index for filtering by severity
    ],
    "reports": [
        [("user_id", 1)],  # Index for user's reports
        [("created_at", -1)]  # Index for sorting by creation date
    ],
    "api_keys": [
        [("user_id", 1)],  # Index for user's API keys
        [("key", 1)]  # Unique index on API key
    ],
    "refresh_tokens": [
        [("user_id", 1)],  # Index for user's refresh tokens
        [("expires_at", 1)]  # Index for token expiration
    ]
}

async def create_indexes():
    """Create all required indexes on startup"""
    logger.info("Creating MongoDB indexes...")
    try:
        for collection_name, indexes in INDEXES.items():
            collection = database[collection_name]
            for index in indexes:
                index_name = await collection.create_index(index)
                logger.info(f"Created index '{index_name}' on collection '{collection_name}'")
        logger.info("All indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}") 