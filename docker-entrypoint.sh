#!/bin/sh
set -e

echo "Waiting for PostgreSQL at db:5432..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready."

echo "Applying Prisma schema..."
npx prisma db push

echo "Seeding database (safe to re-run)..."
npx prisma db seed

echo "Starting API on port 3001..."
exec node dist/src/main.js
