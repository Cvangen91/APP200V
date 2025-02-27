# Variáveis
DC = docker compose
PYTHON = $(DC) exec web python

# Comandos
up:
	$(DC) up -d  # Sobe os containers em background

down:
	$(DC) down  # Derruba os containers

build:
	$(DC) build  # Recompila os containers

migrate:
	$(PYTHON) manage.py migrate  # Aplica migrações

makemigrations:
	$(PYTHON) manage.py makemigrations  # Cria migrações

shell:
	$(PYTHON) manage.py shell  # Abre shell do Django

superuser:
	$(PYTHON) manage.py createsuperuser  # Cria superusuário

logs:
	$(DC) logs -f web  # Mostra logs do container web

test:
	$(PYTHON) manage.py test  # Roda os testes

