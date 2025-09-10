from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import secrets

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NexaSecurity"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_SECRET_KEY: str = "jwt-secret-key"  # Change in production
    JWT_ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nexasec.rw",
        "https://www.nexasec.rw",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    # Database settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_NAME: str = "nexasecurity"

    # Scanning and Testing
    MAX_CONCURRENT_SCANS: int = 3
    MAX_CONCURRENT_PENTESTS: int = 2
    MAX_DAILY_SCANS: int = 10
    MAX_DAILY_PENTESTS: int = 5
    SCAN_TIMEOUT_SECONDS: int = 3600  # 1 hour
    PENTEST_TIMEOUT_SECONDS: int = 7200  # 2 hours
    NMAP_PATH: str = "/usr/bin/nmap"  # Path to nmap binary

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "nexasec@gmail.com"
    EMAIL_FROM_NAME: str = "NexaSec Security"

    # File storage
    SCAN_RESULTS_PATH: str = "./storage/scan_results"
    PENTEST_RESULTS_PATH: str = "./storage/pentest_results"
    REPORT_STORAGE_PATH: str = "./storage/reports"
    TEMPLATE_STORAGE_PATH: str = "./storage/templates"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "./logs/nexasec.log"

    # SSL/TLS
    SSL_KEYFILE: str = "./certs/key.pem"
    SSL_CERTFILE: str = "./certs/cert.pem"

    # Security settings
    ALLOWED_HOSTS: list = ["*"]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings() 