#!/bin/bash

# 1. Load variables from .env file
# This reads the .env file and exports any line that isn't a comment
if [ -f $1 ]; then
    export $(grep -v '^#' $1 | xargs)
else
    echo "Please specify a .env file with the arguments: $0 <path to .env>"
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "Starting backups for $TIMESTAMP..."

# 2. Postgres Backup (Logical Dump)
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$POSTGRES_CONTAINER_NAME" \
  pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$BACKUP_DIR/db_backup.dump"

# 3. MinIO Backup (Volume Archive)
# Note: We use 'docker-compose_minio_data' or whatever 'docker volume ls' shows
docker run --rm \
  -v "$MINIO_VOLUME_NAME":/source_data:ro \
  -v "$BACKUP_DIR":/target \
  alpine tar -czf /target/minio_files.tar.gz -C /source_data .

echo "Backups completed in $BACKUP_DIR"
