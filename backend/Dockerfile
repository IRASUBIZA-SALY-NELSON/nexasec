# Use a stable Python base (3.11 recommended with our bcrypt pin)
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install required system packages for network discovery
# - net-tools provides 'arp' (on Debian/Ubuntu)
# - iputils-arping provides 'arping' (optional alternative)
# - nmap for ping sweep
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      net-tools \
      iputils-arping \
      nmap \
      curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend code and install Python dependencies
# Copy only requirements first to leverage Docker layer caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the backend
COPY backend/ /app/

# Default port (Render injects $PORT at runtime)
ENV PORT=8000

# Start the FastAPI app
# Use python -m uvicorn to ensure the correct interpreter is used
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]