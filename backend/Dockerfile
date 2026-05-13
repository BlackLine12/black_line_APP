FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8000

# Producción: start.sh corre migrate + collectstatic + gunicorn con $PORT.
# El docker-compose sobreescribe con runserver para dev local.
CMD ["./start.sh"]
