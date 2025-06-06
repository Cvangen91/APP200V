from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_judge = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    full_name = models.CharField(max_length=255, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    judge_level = models.CharField(max_length=4, choices=[
        ('DDA', 'DDA'),
        ('DD1', 'DD1'),
        ('DD2', 'DD2'),
        ('DD3', 'DD3'),
        ('DD4', 'DD4')
    ], blank=True)
    judge_since = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.username

class Program(models.Model):
    program_id = models.AutoField(primary_key=True)  # Changed to AutoField for integer IDs
    name = models.CharField(max_length=100)
    equipage_id = models.CharField(max_length=100)
    video_path = models.TextField(blank=True, null=True)  # Added to match the data being loaded
    exercises = models.ManyToManyField('Exercise', related_name='programs')
    exercise_order = models.TextField(blank=True, null=True)  # Armazena a ordem dos exercícios como string

    def __str__(self):
        return self.name

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)  # Changed to AutoField for integer IDs
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Exercise(models.Model):
    exercise_id = models.AutoField(primary_key=True)  # Changed to AutoField for integer IDs
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='exercises')

    def __str__(self):
        return self.name

class ProgramScore(models.Model):
    program_score_id = models.AutoField(primary_key=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    score = models.FloatField()

    def __str__(self):
        return f"ProgramScore {self.program_score_id} - Program: {self.program.name}, Exercise: {self.exercise.name}"

class UserSession(models.Model):
    user_session_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='sessions')
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)  # Campo para armazenar detalhes adicionais em JSON
    
    def __str__(self):
        return f"Session {self.user_session_id} - {self.user.username} - {self.program.name}"

class UserScore(models.Model):
    user_score_id = models.AutoField(primary_key=True)
    user_session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='user_scores')
    correct_score = models.ForeignKey(ProgramScore, on_delete=models.CASCADE, related_name='user_scores')
    user_score = models.DecimalField(max_digits=5, decimal_places=2)
    exercise_name = models.CharField(max_length=255, blank=True, null=True)  # Nome do exercício
    expert_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # Pontuação do especialista
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"User score {self.user_score} for {self.correct_score.exercise.name}"