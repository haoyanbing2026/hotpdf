FROM python:3.12

WORKDIR /app

# Install PDF and Office conversion dependencies.
# Retry failed downloads and allow more time for slow connections.
RUN apt-get update && \
    apt-get install -y \
        -o Acquire::Retries=5 \
        -o Acquire::http::Timeout=120 \
        -o Acquire::https::Timeout=120 \
        --no-install-recommends \
        ghostscript \
        libreoffice-writer \
        libreoffice-impress \
        fonts-liberation && \
    mkdir -p /data && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application.
COPY . .

# Start FastAPI.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
