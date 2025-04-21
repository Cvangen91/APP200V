FROM python:3.10-slim

# Environment settings
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies as root
RUN apt-get update && apt-get install -y \
  gcc \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m usuario
WORKDIR /app
RUN chown usuario:usuario /app

# Switch to non-root user
USER usuario

# Install Python dependencies
COPY --chown=usuario:usuario requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Copy project
COPY --chown=usuario:usuario . .

# Expose port
EXPOSE 8000

# Execution command
CMD ["sh", "-c", "python manage.py makemigrations Learning2Judge && python manage.py migrate && python manage.py load_mock_data && python manage.py runserver 0.0.0.0:8000"]
