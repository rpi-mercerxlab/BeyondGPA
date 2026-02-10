#!/bin/bash

# Define the target directory and the age limit
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found!"
    exit 1
fi

TARGET_DIR="$BACKUP_DIR"
DAYS_OLD=30

# 1. Check if the directory exists to avoid errors
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: $TARGET_DIR does not exist."
  exit 1
fi

if [[ $1 != "-d" ]]; then 
    echo "Dry run: Listing directories older than $DAYS_OLD days in $TARGET_DIR"
    find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +$DAYS_OLD -exec ls -ld {} \;
    echo "To actually delete these directories, run the script with the -d flag: $0 -d"
    exit 0
fi

# 2. Find and delete
# -type d: Look for directories only
# -mtime +30: Modified more than 30 days ago
# -exec rm -rf {}: Delete the found items
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +$DAYS_OLD -exec rm -rf {} \;
