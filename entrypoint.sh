#!/bin/sh
set -e

nginx

exec gunicorn \
  --bind 127.0.0.1:5000 \
  --workers 2 \
  --timeout 120 \
  "backend.app:create_app()"
