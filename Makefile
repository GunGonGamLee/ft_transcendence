DOCKER_COMPOSE = docker-compose


all : up

up :
	$(DOCKER_COMPOSE) up --build

clean :
	$(DOCKER_COMPOSE) down -v

re : clean all

fclean: clean
	docker system prune

show: 
	docker ps -a | tail -n +1; echo
	docker images | tail -n +1; echo
	docker network ls | tail -n +1; echo
	docker volume ls | tail -n +1; echo

.PHONY: all up clean show fclean