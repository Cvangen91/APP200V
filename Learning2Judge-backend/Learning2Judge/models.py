from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_judge = models.BooleanField(default=False) 
    created_at = models.DateTimeField(auto_now_add=True)

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Exercise(models.Model):
    exercise_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='exercises')
    description = models.TextField(blank=True, null=True)
    correct_score = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.name

class UserSession(models.Model):
    user_session_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Session {self.user_session_id} - {self.user.username} - {self.program.name}"

class UserResult(models.Model):
    user_result_id = models.AutoField(primary_key=True)
    user_session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='results')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='user_results')
    user_answer = models.DecimalField(max_digits=5, decimal_places=2)
    percent_correct = models.DecimalField(max_digits=5, decimal_places=2)
    
    def __str__(self):
        return f"Result for {self.exercise.name} by {self.user_session.user.username}"