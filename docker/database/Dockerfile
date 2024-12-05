FROM postgres:14

# Set environment variables for database
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase

# Copy the database initialization script to the Docker entrypoint directory
COPY src/create_database.sh /docker-entrypoint-initdb.d/

# Ensure the script is executable
RUN chmod +x /docker-entrypoint-initdb.d/create_database.sh

# Expose PostgreSQL default port
EXPOSE 5432
