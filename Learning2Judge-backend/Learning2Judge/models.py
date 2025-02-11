from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_judge = models.BooleanField(default=False)  # Exemplo de campo adicional
    created_at = models.DateTimeField(auto_now_add=True)