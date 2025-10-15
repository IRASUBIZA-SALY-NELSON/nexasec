# Use a stable Python base (3.11 recommended with our bcrypt pin)
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install required system packages for network discovery and build tools for Python wheels
# - net-tools provides 'arp' (on Debian/Ubuntu)
# - iputils-arping provides 'arping' (optional alternative)
# - nmap for ping sweep
# - build-essential & python3-dev are needed to compile some deps (e.g., netifaces)
# Install WeasyPrint runtime deps: Cairo, Pango, GDK-PixBuf, GLib/GObject, fonts
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      python3-dev \
      net-tools \
      iputils-arping \
      nmap \
      curl ca-certificates \
      libcairo2 \
      libpango-1.0-0 \
      libpangoft2-1.0-0 \
      libgdk-pixbuf-2.0-0 \
      libglib2.0-0 \
      libgobject-2.0-0 \
      libffi-dev \
      libxml2 \
      libxslt1.1 \
      libfreetype6 \
      libfontconfig1 \
      fonts-dejavu-core \
      fonts-liberation && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend code and install Python dependencies
# Since Render build context is the backend/ directory, COPY directly
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the backend
COPY . /app/

# Default port (Render injects $PORT at runtime)
ENV PORT=8000

# Start the FastAPI app
# Bind to the Render-provided PORT (fallback to 8000 locally)
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]