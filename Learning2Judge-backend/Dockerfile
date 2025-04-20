FROM python:3.10-slim

# Configurações de ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instala dependências do sistema como root
RUN apt-get update && apt-get install -y \
  gcc \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Cria usuário para evitar rodar como root
RUN useradd -m usuario
WORKDIR /app
RUN chown usuario:usuario /app

# Muda para o usuário não-root
USER usuario

# Instala dependências do Python
COPY --chown=usuario:usuario requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Copia o projeto
COPY --chown=usuario:usuario . .

# Porta exposta
EXPOSE 8000

# Comando de execução
CMD ["sh", "-c", "python manage.py makemigrations Learning2Judge && python manage.py migrate && python manage.py load_mock_data && python manage.py runserver 0.0.0.0:8000"]
