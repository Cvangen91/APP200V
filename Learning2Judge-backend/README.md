# Learning2Judge API

This repository contains a Django project using [django-ninja](https://django-ninja.rest-framework.com/) to build a REST API.

## Prerequisites

- Python 3.8 or higher
- [Docker](https://www.docker.com/get-started)
- [Make](https://www.gnu.org/software/make/)

## Running the Project with Docker

The project includes a `Dockerfile` and `docker-compose.yml` to simplify setup.

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and Start the Services**
   ```bash
   make build
   make up
   ```

3. **Access the API**
   - The API runs at: [http://localhost:8000](http://localhost:8000)
   - Interactive docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

4. **Stop the Services**
   ```bash
   make down
   ```

## Running Without Docker

If you prefer to run the project manually:

1. **Create and Activate a Virtual Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Apply Migrations**
   ```bash
   python manage.py migrate
   ```

4. **Run the Server**
   ```bash
   python manage.py runserver
   ```

The API will be available at [http://localhost:8000](http://localhost:8000).

## Makefile Commands

To simplify common tasks, a `Makefile` is included:

```bash
make build    # Build Docker images
make up       # Start the containers
make down     # Stop the containers
make migrate  # Apply database migrations
make superuser  # Create a superuser
make logs     # Show logs
```

## Additional Notes
- Ensure Docker is installed and running before using `make up`.
- The database runs inside a PostgreSQL container.
- If needed, update environment variables in `.env`.

This setup ensures a consistent development environment for all team members. 🚀

