#!/bin/sh
set -e
echo "Running MeetingIQ migrations..."
node /app/scripts/migrate.js
node /app/scripts/seed-dev-users.js
echo "Starting BFF..."
exec node /app/apps/bff/src/index.js
