FROM python:3.11-slim

WORKDIR /app

# Install deps first (better cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Now copy your whole project (app/, client/, db/, wsgi.py, etc.)
COPY . ./

# Make sure Python can import the 'app' package at /app/app
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Run the Flask app via Gunicorn
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "wsgi:app"]
