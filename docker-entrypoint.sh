#!/bin/sh
set -e

# Default host and port
DB_HOST="db"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  # Strip protocol and credentials (everything up to the last @)
  HOST_PORT_PATH="${DATABASE_URL##*@}"
  # Strip path and options (everything after the first /)
  HOST_PORT="${HOST_PORT_PATH%%/*}"
  
  case "$HOST_PORT" in
    *:*)
      DB_HOST="${HOST_PORT%%:*}"
      DB_PORT="${HOST_PORT##*:}"
      ;;
    *)
      DB_HOST="$HOST_PORT"
      DB_PORT="5432"
      ;;
  esac
fi

echo "Checking PostgreSQL connection at $DB_HOST:$DB_PORT..."
MAX_RETRIES=15
RETRY_COUNT=0

while ! nc -z -w 2 "$DB_HOST" "$DB_PORT"; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Warning: Database connection check timed out after $MAX_RETRIES seconds. Proceeding anyway..."
    break
  fi
  echo "Database not ready yet. Retrying ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 1
done

if [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; then
  echo "Database is ready."
fi

echo "Applying Prisma schema..."
npx prisma db push

echo "Seeding database (safe to re-run)..."
npx prisma db seed

echo "Starting API on port 3001..."
exec node dist/src/main.js

