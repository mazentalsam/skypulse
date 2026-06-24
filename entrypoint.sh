#!/bin/sh
set -e

export PORT="${PORT:-80}"

envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf

nginx

exec gunicorn \
  --bind 127.0.0.1:5000 \
  --workers 2 \
  --timeout 120 \
  "backend.app:create_app()"
