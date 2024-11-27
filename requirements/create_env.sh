#!/bin/bash

# Create the .env file
ENV_FILE="./requirements/.env"

# Check if the .env file already exists, warn the user if it does
if [ -f "$ENV_FILE" ]; then
  echo ".env file already exists. Do you want to overwrite it? (y/n)"
  read -r overwrite
  if [ "$overwrite" != "y" ]; then
    echo "Creation process canceled."
    exit 0
  fi
fi

# Prompt the user for input or use default values
echo "Django Secret Key (leave empty to generate automatically):"
read -r SECRET_KEY
if [ -z "$SECRET_KEY" ]; then
  SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")
fi

echo "Debug mode (1 = True, 0 = False) [Default: 1]:"
read -r DEBUG
DEBUG=${DEBUG:-1}

echo "Allowed Hosts (comma-separated) [Default: *]:"
read -r ALLOWED_HOSTS
ALLOWED_HOSTS=${ALLOWED_HOSTS:-*}

echo "Postgres Database Name [Default: mydatabase]:"
read -r POSTGRES_DB
POSTGRES_DB=${POSTGRES_DB:-mydatabase}

echo "Postgres Username [Default: myuser]:"
read -r POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-myuser}

echo "Postgres Password [Default: mypassword]:"
read -r POSTGRES_PASSWORD
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-mypassword}

echo "Postgres Host [Default: database]:"
read -r DB_HOST
DB_HOST=${DB_HOST:-database}

echo "Postgres Port [Default: 5432]:"
read -r DB_PORT
DB_PORT=${DB_PORT:-5432}

# Create and write the .env file
cat <<EOL > "$ENV_FILE"
# Django Environment Variables
SECRET_KEY=$SECRET_KEY
DEBUG=$DEBUG
ALLOWED_HOSTS=$ALLOWED_HOSTS

# Postgres Configuration
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
EOL

echo ".env file has been successfully created."
