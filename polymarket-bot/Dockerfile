FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY polybot ./polybot

RUN useradd --create-home bot && mkdir -p /app/data /app/logs && chown -R bot /app
USER bot
VOLUME ["/app/data", "/app/logs"]
CMD ["python", "-m", "polybot", "run"]
