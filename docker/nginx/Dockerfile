FROM nginx:alpine

# Nginx'in gerekli dizinlerini oluştur
RUN mkdir -p /etc/nginx/ssl /var/www/html

# Self-signed SSL sertifikası oluştur
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Diffie-Hellman parametresi oluştur (Opsiyonel)
RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port for HTTPS
EXPOSE 443
EXPOSE 80

# Nginx başlat
CMD ["nginx", "-g", "daemon off;"]
