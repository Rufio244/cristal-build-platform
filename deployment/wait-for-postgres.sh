#!/bin/sh
set -eu
until pg_isready -h "${POSTGRES_HOST:-postgres}" -U "${POSTGRES_USER:-cristal}" -d "${POSTGRES_DB:-cristal_build}"; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
exec "$@"
