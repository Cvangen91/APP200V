from ninja import NinjaAPI, Router
from django.contrib.auth import authenticate
from ninja_extra import NinjaExtraAPI
from django.shortcuts import get_object_or_404
from typing import List
from .models import User, Category, Program, Exercise, UserSession, UserScore, CorrectScore
from .schemas import (
    UserCreateSchema, UserSchema, UserUpdateSchema, UserLoginSchema, 
    CategorySchema, CategoryCreateSchema,
    ProgramSchema, ProgramCreateSchema, ProgramDetailSchema,
    ExerciseSchema, ExerciseCreateSchema,
    CorrectScoreSchema, CorrectScoreCreateSchema,
    UserSessionSchema, UserSessionCreateSchema, UserSessionDetailSchema,
    UserScoreSchema, UserScoreCreateSchema
)
from ninja.security import HttpBearer
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth
from django.db.models import Prefetch

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

@api.post("/register", auth=None, response={200: UserSchema, 400: dict, 500: dict})
def register_user(request, payload: UserCreateSchema):
    if User.objects.filter(username=payload.username).exists():
        return 400, {"error": "Username already registered"}

    if User.objects.filter(email=payload.email).exists():
        return 400, {"error": "Email already registered"}

    try:
        user = User.objects.create_user(
            username=payload.username,
            email=payload.email,
            password=payload.password.get_secret_value()
        )
        return 200, {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_judge": user.is_judge,
            "created_at": user.created_at
        }
    except Exception as e:
        return 500, {"error": str(e)}

@api.get("/users/me", response=UserSchema, auth=JWTAuth())
def get_current_user(request):
    return request.user

@api.put("/users/me", response=UserSchema, auth=JWTAuth())
def update_user(request, payload: UserUpdateSchema):
    user = request.user
    if payload.email:
        user.email = payload.email
    user.save()
    return user

# Category endpoints
@api.get("/categories", response=List[CategorySchema], auth=JWTAuth())
def list_categories(request):
    return Category.objects.all()

@api.get("/categories/{category_id}", response={200: CategorySchema, 404: dict}, auth=JWTAuth())
def get_category(request, category_id: str):  # Changed back to str because the DB field is character varying
    try:
        return 200, get_object_or_404(Category, category_id=category_id)
    except Category.DoesNotExist:
        return 404, {"error": f"Category with ID '{category_id}' not found"}

@api.post("/categories", response={200: CategorySchema, 400: dict}, auth=JWTAuth())
def create_category(request, payload: CategoryCreateSchema):
    try:
        category = Category.objects.create(**payload.dict())
        return 200, category
    except Exception as e:
        return 400, {"error": str(e)}

@api.put("/categories/{category_id}", response={200: CategorySchema, 404: dict, 400: dict}, auth=JWTAuth())
def update_category(request, category_id: str, payload: CategoryCreateSchema):  # Changed back to str
    try:
        category = get_object_or_404(Category, category_id=category_id)
        for attr, value in payload.dict().items():
            setattr(category, attr, value)
        category.save()
        return 200, category
    except Category.DoesNotExist:
        return 404, {"error": f"Category with ID '{category_id}' not found"}
    except Exception as e:
        return 400, {"error": str(e)}

@api.delete("/categories/{category_id}", response={200: dict, 404: dict}, auth=JWTAuth())
def delete_category(request, category_id: str):  # Changed back to str
    try:
        category = get_object_or_404(Category, category_id=category_id)
        category.delete()
        return 200, {"success": True}
    except Category.DoesNotExist:
        return 404, {"error": f"Category with ID '{category_id}' not found"}

# Program endpoints
@api.get("/programs", response=List[ProgramSchema], auth=JWTAuth())
def list_programs(request):
    return Program.objects.all()  # Let the schema handle serialization

@api.get("/programs/{program_id}", response=ProgramDetailSchema, auth=JWTAuth())
def get_program(request, program_id: int):  # Changed to integer
    program = get_object_or_404(Program, program_id=program_id)
    exercise_ids = CorrectScore.objects.filter(program=program).values_list('exercise_id', flat=True).distinct()
    return {
        "program_id": program.program_id,
        "name": program.name,
        "description": program.description,
        "equipage_id": program.equipage_id,
        "exercises": list(exercise_ids)
    }

@api.post("/programs", response=ProgramSchema, auth=JWTAuth())
def create_program(request, payload: ProgramCreateSchema):
    program = Program.objects.create(**payload.dict())
    return program

@api.put("/programs/{program_id}", response=ProgramSchema, auth=JWTAuth())
def update_program(request, program_id: int, payload: ProgramCreateSchema):
    program = get_object_or_404(Program, program_id=program_id)
    for attr, value in payload.dict().items():
        setattr(program, attr, value)
    program.save()
    return program

@api.delete("/programs/{program_id}", auth=JWTAuth())
def delete_program(request, program_id: int):
    program = get_object_or_404(Program, program_id=program_id)
    program.delete()
    return {"success": True}

# Exercise endpoints
@api.get("/exercises", response=List[ExerciseSchema], auth=JWTAuth())
def list_exercises(request):
    return Exercise.objects.all()

@api.get("/exercises/category/{category_id}", response=List[ExerciseSchema], auth=JWTAuth())
def list_exercises_by_category(request, category_id: str):  # Changed to str to match DB field type
    return Exercise.objects.filter(category_id=category_id)

@api.get("/exercises/{exercise_id}", response=ExerciseSchema, auth=JWTAuth())
def get_exercise(request, exercise_id: int):
    return get_object_or_404(Exercise, exercise_id=exercise_id)

@api.post("/exercises", response=ExerciseSchema, auth=JWTAuth())
def create_exercise(request, payload: ExerciseCreateSchema):
    exercise = Exercise.objects.create(**payload.dict())
    return exercise

@api.put("/exercises/{exercise_id}", response=ExerciseSchema, auth=JWTAuth())
def update_exercise(request, exercise_id: int, payload: ExerciseCreateSchema):
    exercise = get_object_or_404(Exercise, exercise_id=exercise_id)
    for attr, value in payload.dict().items():
        setattr(exercise, attr, value)
    exercise.save()
    return exercise

@api.delete("/exercises/{exercise_id}", auth=JWTAuth())
def delete_exercise(request, exercise_id: int):
    exercise = get_object_or_404(Exercise, exercise_id=exercise_id)
    exercise.delete()
    return {"success": True}

# CorrectScore endpoints
@api.get("/correct-scores", response=List[CorrectScoreSchema], auth=JWTAuth())
def list_correct_scores(request):
    return CorrectScore.objects.all()

@api.get("/correct-scores/program/{program_id}", response=List[CorrectScoreSchema], auth=JWTAuth())
def list_correct_scores_by_program(request, program_id: int):
    return CorrectScore.objects.filter(program_id=program_id)

@api.get("/correct-scores/exercise/{exercise_id}", response=List[CorrectScoreSchema], auth=JWTAuth())
def list_correct_scores_by_exercise(request, exercise_id: int):
    return CorrectScore.objects.filter(exercise_id=exercise_id)

@api.get("/correct-scores/{correct_score_id}", response=CorrectScoreSchema, auth=JWTAuth())
def get_correct_score(request, correct_score_id: int):
    return get_object_or_404(CorrectScore, correct_score_id=correct_score_id)

@api.post("/correct-scores", response=CorrectScoreSchema, auth=JWTAuth())
def create_correct_score(request, payload: CorrectScoreCreateSchema):
    correct_score = CorrectScore.objects.create(**payload.dict())
    return correct_score

@api.put("/correct-scores/{correct_score_id}", response=CorrectScoreSchema, auth=JWTAuth())
def update_correct_score(request, correct_score_id: int, payload: CorrectScoreCreateSchema):
    correct_score = get_object_or_404(CorrectScore, correct_score_id=correct_score_id)
    for attr, value in payload.dict().items():
        setattr(correct_score, attr, value)
    correct_score.save()
    return correct_score

@api.delete("/correct-scores/{correct_score_id}", auth=JWTAuth())
def delete_correct_score(request, correct_score_id: int):
    correct_score = get_object_or_404(CorrectScore, correct_score_id=correct_score_id)
    correct_score.delete()
    return {"success": True}

# UserSession endpoints
@api.get("/user-sessions", response=List[UserSessionSchema], auth=JWTAuth())
def list_user_sessions(request):
    return UserSession.objects.filter(user=request.user)

@api.get("/user-sessions/{user_session_id}", response=UserSessionDetailSchema, auth=JWTAuth())
def get_user_session(request, user_session_id: int):
    user_session = get_object_or_404(UserSession, user_session_id=user_session_id, user=request.user)
    
    # Get related scores
    scores = UserScore.objects.filter(user_session=user_session)
    
    return {
        "user_session_id": user_session.user_session_id,
        "user_id": user_session.user.id,
        "program_id": user_session.program.program_id,
        "timestamp": user_session.timestamp,
        "program_name": user_session.program.name,
        "scores": scores
    }

@api.post("/user-sessions", response=UserSessionSchema, auth=JWTAuth())
def create_user_session(request, payload: UserSessionCreateSchema):
    user_session = UserSession.objects.create(
        user=request.user,
        program_id=payload.program_id
    )
    return user_session

@api.delete("/user-sessions/{user_session_id}", auth=JWTAuth())
def delete_user_session(request, user_session_id: int):
    user_session = get_object_or_404(UserSession, user_session_id=user_session_id, user=request.user)
    user_session.delete()
    return {"success": True}

# UserScore endpoints
@api.get("/user-scores/session/{user_session_id}", response=List[UserScoreSchema], auth=JWTAuth())
def list_user_scores_by_session(request, user_session_id: int):
    user_session = get_object_or_404(UserSession, user_session_id=user_session_id, user=request.user)
    return UserScore.objects.filter(user_session=user_session)

@api.get("/user-scores/{user_score_id}", response=UserScoreSchema, auth=JWTAuth())
def get_user_score(request, user_score_id: int):
    user_score = get_object_or_404(UserScore, user_score_id=user_score_id)
    user_session = user_score.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    return user_score

@api.post("/user-scores", response=UserScoreSchema, auth=JWTAuth())
def create_user_score(request, payload: UserScoreCreateSchema):
    user_session = get_object_or_404(UserSession, user_session_id=payload.user_session_id)
    
    # Ensure the user owns this session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    
    # Create the user score
    user_score = UserScore.objects.create(**payload.dict())
    return user_score

@api.delete("/user-scores/{user_score_id}", auth=JWTAuth())
def delete_user_score(request, user_score_id: int):
    user_score = get_object_or_404(UserScore, user_score_id=user_score_id)
    # Check if user has permission (is the owner of the session)
    user_session = user_score.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    user_score.delete()
    return {"success": True}

# Analytics endpoints
@api.get("/analytics/user-performance", auth=JWTAuth())
def user_performance(request):
    """Get performance analytics for the current user"""
    user_sessions = UserSession.objects.filter(user=request.user)
    total_sessions = user_sessions.count()
    
    if total_sessions == 0:
        return {
            "total_sessions": 0,
            "average_score": 0,
            "total_exercises_judged": 0,
            "performance": {}
        }
    
    # Get all user scores
    user_scores = UserScore.objects.filter(user_session__in=user_sessions).select_related('correct_score__exercise')
    
    # Calculate statistics
    total_exercises = user_scores.count()
    if total_exercises == 0:
        average_score = 0
    else:
        # Calculate average difference between user_score and correct_score
        score_accuracy = 0
        for score in user_scores:
            score_diff = abs(score.user_score - score.correct_score.correct_score)
            max_possible_diff = 10  # Assuming scores are on a scale of 0-10
            accuracy = (1 - (score_diff / max_possible_diff)) * 100
            score_accuracy += accuracy
        
        average_score = score_accuracy / total_exercises
    
    # Group by category
    category_performance = {}
    for score in user_scores:
        category_name = score.correct_score.exercise.category.name
        if category_name not in category_performance:
            category_performance[category_name] = {
                "exercises_judged": 0,
                "accuracy": 0
            }
        
        score_diff = abs(score.user_score - score.correct_score.correct_score)
        max_possible_diff = 10  # Assuming scores are on a scale of 0-10
        accuracy = (1 - (score_diff / max_possible_diff)) * 100
        
        category_performance[category_name]["exercises_judged"] += 1
        category_performance[category_name]["accuracy"] += accuracy
    
    # Calculate average for each category
    for category, stats in category_performance.items():
        stats["accuracy"] = stats["accuracy"] / stats["exercises_judged"]
    
    return {
        "total_sessions": total_sessions,
        "average_score": average_score,
        "total_exercises_judged": total_exercises,
        "performance_by_category": category_performance
    }
