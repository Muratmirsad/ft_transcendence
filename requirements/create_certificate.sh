#!/bin/bash

SSL_DIR="./app/nginx/ssl"

CERT_FILE="$SSL_DIR/certificate.pem"
KEY_FILE="$SSL_DIR/certificate.key"

if [ ! -d "$SSL_DIR" ]; then
    echo "Creating directory for SSL certificates: $SSL_DIR"
    mkdir -p "$SSL_DIR"
fi

if [ -f "$CERT_FILE" ] || [ -f "$KEY_FILE" ]; then
    echo "Certificate files already exist: $CERT_FILE and $KEY_FILE"
    echo "Do you want to overwrite them? (y/n)"
    read -r overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Operation canceled."
        exit 0
    fi
fi

echo "Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=US/ST=Local/L=Local/O=Local/OU=Local/CN=localhost"

if [ $? -eq 0 ]; then
    echo "SSL certificate successfully created:"
    echo "  Certificate: $CERT_FILE"
    echo "  Key        : $KEY_FILE"
else
    echo "Failed to create SSL certificate."
    exit 1
fi
