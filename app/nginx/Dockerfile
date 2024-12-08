# nginx
FROM nginx:alpine

# Install Certbot
RUN apk add --no-cache certbot certbot-nginx

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx with SSL setup
