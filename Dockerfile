# Production Dockerfile for Date Consistency Validation Platform
FROM python:3.12-slim

# Install OpenJDK Java Runtime for PySpark
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jre-headless \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project source files
COPY . .

EXPOSE 8000

# Start FastAPI Uvicorn server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
