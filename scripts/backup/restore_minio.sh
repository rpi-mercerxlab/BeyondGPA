#!/usr/bin/env bash

# 1. Load variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

# 2. Check if a filename was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_filename.tar.gz>"
    echo "Note: Script looks inside $BACKUP_DIR"
    exit 1
fi

BACKUP_FILE="$1"
# If the user just provides a filename, we assume it's in BACKUP_DIR. If they provide a path, we use should use that directly.
if [[ "$BACKUP_FILE" == "$BACKUP_DIR"/* ]]; then
    FULL_PATH="$BACKUP_FILE"
else
FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"
fi

# 3. Verify the file actually exists before stopping services
if [ ! -f "$FULL_PATH" ]; then
    echo "Error: File $FULL_PATH not found!"
    echo "Please ensure the backup file exists in $BACKUP_DIR"
    exit 1
fi

echo "--- Starting Restore Process ---"

# 4. Stop the container to ensure data consistency
echo "Stopping $MINIO_CONTAINER_NAME..."
docker stop "$MINIO_CONTAINER_NAME"

# 5. Run the restore using the helper container
# We mount BACKUP_DIR so the container can see the specific file
echo "Restoring data to volume: $MINIO_VOLUME_NAME..."
docker run --rm \
  -v "$MINIO_VOLUME_NAME":/dest_data \
  -v "$BACKUP_DIR":/$BACKUP_DIR:ro \
  alpine sh -c "rm -rf /dest_data/* && tar -xzf /$FULL_PATH -C /dest_data"

# 6. Restart the container
echo "Starting $MINIO_CONTAINER_NAME..."
docker start "$MINIO_CONTAINER_NAME"

echo "--- Restore Complete ---"
