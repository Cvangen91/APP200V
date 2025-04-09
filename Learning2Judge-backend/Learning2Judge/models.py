from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_judge = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    birthdate = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.username

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    equipage_id = models.IntegerField(null=True, blank=True)  # Added equipage_id field

    def __str__(self):
        return self.name

class Exercise(models.Model):
    exercise_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='exercises')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class CorrectScore(models.Model):
    correct_score_id = models.AutoField(primary_key=True)
    correct_score = models.DecimalField(max_digits=5, decimal_places=2)
    execution_number = models.IntegerField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='correct_scores')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='correct_scores')
    
    def __str__(self):
        return f"Score {self.correct_score} for {self.exercise.name} in {self.program.name}"

class UserSession(models.Model):
    user_session_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='sessions')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Session {self.user_session_id} - {self.user.username} - {self.program.name}"

class UserScore(models.Model):
    user_score_id = models.AutoField(primary_key=True)
    user_session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='user_scores')
    correct_score = models.ForeignKey(CorrectScore, on_delete=models.CASCADE, related_name='user_scores')
    user_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    def __str__(self):
        return f"User score {self.user_score} for {self.correct_score.exercise.name}"