#!/bin/bash

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
BACKUP_PATH="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${POSTGRES_DB}_${TIMESTAMP}.dump"

mkdir -p $BACKUP_PATH

# 3. Run the backup
# We pass PGPASSWORD so pg_dump doesn't prompt for it
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" $CONTAINER_NAME \
  pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$BACKUP_PATH/$FILENAME"

echo "Backup created at $BACKUP_PATH/$FILENAME"
