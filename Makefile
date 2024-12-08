# Define commands
up:
	@docker-compose -f requirements/docker-compose.yml up --build -d

down:
	@docker-compose -f requirements/docker-compose.yml down

restart:
	@make down
	@make up

logs:
	@docker-compose -f requirements/docker-compose.yml logs -f

ps:
	@docker-compose -f requirements/docker-compose.yml ps

clean:
	@echo "Stopping and removing all containers, networks, and volumes..."
	@docker-compose -f requirements/docker-compose.yml down --volumes --remove-orphans
	@docker system prune -af --volumes
	@echo "Cleanup complete."

rebuild:
	@make clean
	@make up

env:
	@chmod +x ./requirements/create_env.sh
	@./requirements/create_env.sh

key:
	@chmod +x ./requirements/create_certificate.sh
	@./requirements/create_certificate.sh

# Help message
help:
	@echo "Available commands:"
	@echo "  make up        - Start the project"
	@echo "  make down      - Stop the project"
	@echo "  make restart   - Restart the project"
	@echo "  make logs      - Show logs"
	@echo "  make ps        - Show running containers"
	@echo "  make clean     - Remove all containers, networks, and volumes"
	@echo "  make rebuild   - Clean and rebuild the project"