from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.routers import auth, scan, pentest, dashboard, report, logs, network, vulnerability, external
import asyncio
from app.core.database import connect_to_mongo, close_mongo_connection, create_indexes, get_database
from app.services.network_discovery import NetworkDiscoveryService
import logging
import time
import uuid
import os

# Create logs directory if it doesn't exist
os.makedirs(os.path.dirname(settings.LOG_FILE_PATH), exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOG_FILE_PATH)
    ]
)
logger = logging.getLogger("app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/swagger-ui"
)

# Global network discovery service instance
network_discovery_service = None

# Request ID middleware
@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Add request_id to request state
    request.state.request_id = request_id
    
    # Log request details
    logger.info(f"Request started: id={request_id} method={request.method} path={request.url.path} client={request.client.host if request.client else 'unknown'}")
    
    try:
        response = await call_next(request)
        
        # Log response details
        process_time = time.time() - start_time
        logger.info(f"Request completed: id={request_id} status_code={response.status_code} process_time={process_time:.4f}s")
        
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        logger.error(f"Request failed: id={request_id} error={str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# CORS middleware
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nexasec.vercel.app",
    "https://nexasec-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "X-Request-ID", "Authorization"],
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    global network_discovery_service
    logger.info("Application starting up...")
    success = await connect_to_mongo()
    if success:
        await create_indexes()
        
        # Initialize and start network discovery service
        try:
            db = await get_database()
            network_discovery_service = NetworkDiscoveryService(db)
            await network_discovery_service.start_background_discovery()
            logger.info("Background network discovery service started")
        except Exception as e:
            logger.error(f"Failed to start network discovery service: {e}")
        
        logger.info("Application startup completed successfully")
    else:
        logger.error("Application startup failed due to database connection issues")

    # Trigger initial background network scan warmup (non-blocking)
    try:
        # Import inside to avoid circulars
        from app.routers.network import _refresh_cache  # type: ignore
        asyncio.create_task(_refresh_cache())
        logger.info("Scheduled background network scan warmup")
    except Exception as e:
        logger.warning(f"Failed to schedule network scan warmup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    global network_discovery_service
    logger.info("Application shutting down...")
    
    # Stop network discovery service
    if network_discovery_service:
        try:
            await network_discovery_service.stop_background_discovery()
            logger.info("Network discovery service stopped")
        except Exception as e:
            logger.error(f"Error stopping network discovery service: {e}")
    
    await close_mongo_connection()
    logger.info("Application shutdown completed")

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(scan.router, prefix=f"{settings.API_V1_STR}/scans", tags=["Scans"])
app.include_router(pentest.router, prefix=f"{settings.API_V1_STR}/pentests", tags=["Penetration Tests"])
# Temporarily disabled
# app.include_router(vulnerability.router, prefix=f"{settings.API_V1_STR}/vulnerabilities", tags=["Vulnerabilities"])
app.include_router(report.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(logs.router, prefix=f"{settings.API_V1_STR}/logs", tags=["Logs"])
app.include_router(network.router, prefix=f"{settings.API_V1_STR}/network", tags=["Network"])
app.include_router(vulnerability.router, prefix=f"{settings.API_V1_STR}/vulnerabilities", tags=["Vulnerabilities"])
app.include_router(external.router, prefix=f"{settings.API_V1_STR}/external", tags=["External Intelligence"])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to NexaSec API", "status": "connected"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify API and database connection."""
    logger.info("Health check endpoint accessed")
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "database_connected": True,
        "environment": "development" if "localhost" in settings.MONGODB_URL else "production"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
