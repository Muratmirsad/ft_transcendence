#!/bin/bash

# .env dosyasını yükle
if [ ! -f "./requirements/.env" ]; then
  echo ".env file not found in ./requirements/"
  exit 1
fi

export $(grep -v '^#' ./requirements/.env | xargs)

# Gerekli değişkenlerin mevcut olduğunu kontrol et
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
  echo "POSTGRES_DB, POSTGRES_USER ve POSTGRES_PASSWORD çevre değişkenlerini .env dosyasında tanımlayın."
  exit 1
fi

# PostgreSQL'de veritabanı ve kullanıcı oluştur
echo "Creating database '$POSTGRES_DB' and user '$POSTGRES_USER'..."

sudo -u postgres psql <<EOF
DO
\$do\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = '$POSTGRES_USER') THEN
      CREATE ROLE $POSTGRES_USER LOGIN PASSWORD '$POSTGRES_PASSWORD';
   END IF;
END
\$do\$;

CREATE DATABASE $POSTGRES_DB
    OWNER $POSTGRES_USER
    TEMPLATE template0
    ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOF

echo "Database and user created successfully."
