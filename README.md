# Learning2Judge API

This repository contains a Django project that demonstrates a simple REST API built using [django-ninja](https://django-ninja.rest-framework.com/) with JWT authentication. The project includes a custom user model with an additional field (`is_judge`), user registration, login endpoints, and a protected endpoint that returns the authenticated user's profile information.

## Project Overview

- **Custom User Model:** Extends Django’s default user model by adding an `email` field (which is unique) and an `is_judge` boolean field.
- **API Endpoints:**  
  - **Registration:** Create a new user.
  - **Login:** Authenticate user credentials.
  - **JWT Authentication:** Utilize django-ninja-jwt for generating and refreshing JWT tokens.
  - **Protected Route:** Example `/profile` endpoint that requires JWT authentication to access user details.
- **Interactive API Docs:** Automatically generated using django-ninja, accessible at `/api/docs` when the server is running.

## Prerequisites

- Python 3.8 or higher
- [pip](https://pip.pypa.io/en/stable/)

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create and Activate a Virtual Environment**

   For Linux/macOS:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
   For Windows:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. **Install Dependencies**

   If you have a `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```
   Otherwise, install the necessary packages manually:
   ```bash
   pip install django django-ninja python-decouple django-ninja-jwt
   ```

## Useful Commands

Below are some commonly used commands for developing and managing the project:

- **Activate Virtual Environment**

  - Linux/macOS:
    ```bash
    source .venv/bin/activate
    ```
  - Windows:
    ```bash
    .venv\Scripts\activate
    ```

- **Run Database Migrations**

  Generate and apply database migrations:
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

- **Run the Development Server**

  Start the server locally:
  ```bash
  python manage.py runserver
  ```
  Once the server is running, you can access the interactive API documentation at:
  [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

- **Create a Superuser**

  To access the Django admin panel:
  ```bash
  python manage.py createsuperuser
  ```

- **Check Project Status**

  See the current status of your Git repository:
  ```bash
  git status
  ```

- **Commit Changes**

  Add changes and commit:
  ```bash
  git add .
  git commit -m "Your commit message"
  ```

- **Push Changes to GitHub**

  If you already have the remote configured and your branch (e.g., main) is set up:
  ```bash
  git push -u origin main
  ```

## Running the API

After installing dependencies and setting up your virtual environment:

1. **Activate the virtual environment.**
2. **Run the migrations.**
3. **Start the server.**
4. **Access the interactive documentation at** [http://localhost:8000/api/docs](http://localhost:8000/api/docs).

## Additional Recommendations

- **Email Verification:**  
  Consider implementing email confirmation after registration using libraries such as [django-allauth](https://django-allauth.readthedocs.io/en/latest/).
