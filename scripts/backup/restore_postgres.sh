# !/usr/bin/env bash

# 1. Load variables from .env file
# This reads the .env file and exports any line that isn't a comment
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found!"
    exit 1
fi

# 2. Configuration (Using the variable names from your .env)
# Replace POSTGRES_USER etc. with whatever names you actually use in your file
CONTAINER_NAME="beyondgpa-database-1"
RESTORE_FILE_PATH="$1"
if [ -z "$RESTORE_FILE_PATH" ]; then
    echo "Usage: $0 <path_to_backup_file>"
    exit 1
fi

# 3. Verify the file actually exists before stopping services
if [ ! -f "$RESTORE_FILE_PATH" ]; then
    echo "Error: File $RESTORE_FILE_PATH not found!"
    echo "Please ensure the backup file exists at the specified path"
    exit 1
fi

# 4. Run the restore
# We pass PGPASSWORD so pg_restore doesn't prompt for it
cat "$RESTORE_FILE_PATH" | docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" $CONTAINER_NAME \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --role="$POSTGRES_USER"

echo "Database restored from $RESTORE_FILE_PATH"

