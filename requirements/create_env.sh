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

SECRET_KEY_AUTH=$SECRET_KEY
SECRET_KEY_PONG=$SECRET_KEY

echo "Allowed Hosts (comma-separated) [Default: *]:"
read -r ALLOWED_HOSTS
ALLOWED_HOSTS=${ALLOWED_HOSTS:-*}

echo "Postgres Username [Default: postgres]:"
read -r POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postgres}

echo "Postgres Password [Default: mysecretpassword]:"
read -r POSTGRES_PASSWORD
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-mysecretpassword}

echo "Postgres Database Name [Default: postgres]:"
read -r POSTGRES_DB
POSTGRES_DB=${POSTGRES_DB:-postgres}

echo "Postgres Host [Default: db]:"
read -r DB_HOST
DB_HOST=${DB_HOST:-db}

echo "Postgres Port [Default: 5432]:"
read -r DB_PORT
DB_PORT=${DB_PORT:-5432}

echo "CSRF Trusted Origins [Default: https://127.0.0.1]:"
read -r CSRF_TRUSTED_ORIGINS
CSRF_TRUSTED_ORIGINS=${CSRF_TRUSTED_ORIGINS:-https://127.0.0.1}

echo "CORS Origin Whitelist [Default: https://127.0.0.1]:"
read -r CORS_ORIGIN_WHITELIST
CORS_ORIGIN_WHITELIST=${CORS_ORIGIN_WHITELIST:-https://127.0.0.1}

# Create and write the .env file
cat <<EOL > "$ENV_FILE"
# Django Environment Variables
SECRET_KEY=$SECRET_KEY
SECRET_KEY_AUTH=$SECRET_KEY_AUTH
SECRET_KEY_PONG=$SECRET_KEY_PONG
ALLOWED_HOSTS=$ALLOWED_HOSTS

# Docker-compose settings
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}

# CSRF and CORS settings
CSRF_TRUSTED_ORIGINS=$CSRF_TRUSTED_ORIGINS
CORS_ORIGIN_WHITELIST=$CORS_ORIGIN_WHITELIST
EOL

echo ".env file has been successfully created."
