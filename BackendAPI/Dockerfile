# Simple Dockerfile for the BackendAPI
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY app ./app
COPY .env.example ./.env

EXPOSE 8000

# Use env PORT if provided
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
