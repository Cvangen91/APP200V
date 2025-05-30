from ninja import NinjaAPI, Router
from django.contrib.auth import authenticate
from ninja_extra import NinjaExtraAPI
from django.shortcuts import get_object_or_404
from typing import List
from .models import User, Category, Program, Exercise, UserSession, UserScore, ProgramScore
from .schemas import (
    UserCreateSchema, UserSchema, UserUpdateSchema, UserLoginSchema, 
    CategorySchema, CategoryCreateSchema,
    ProgramSchema, ProgramCreateSchema, ProgramDetailSchema,
    ExerciseSchema, ExerciseCreateSchema,
    ProgramScoreSchema, ProgramScoreCreateSchema,
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
            password=payload.password.get_secret_value(),
            full_name=payload.full_name,
            birth_date=payload.birth_date,
            judge_level=payload.judge_level,
            judge_since=payload.judge_since
        )
        return 200, {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_judge": user.is_judge,
            "created_at": user.created_at,
            "full_name": user.full_name,
            "birth_date": user.birth_date,
            "judge_level": user.judge_level,
            "judge_since": user.judge_since
        }
    except Exception as e:
        return 500, {"error": str(e)}

@api.get("/users/me", response=UserSchema, auth=JWTAuth())
def get_current_user(request):
    return request.user

@api.put("/users/me", response=UserSchema, auth=JWTAuth())
def update_user(request, payload: UserUpdateSchema):
    try:
        user = request.user
        print(f"Atualizando usuário {user.id} com dados: {payload.dict()}")
        
        if payload.email is not None:
            user.email = payload.email
            print(f"Email atualizado para: {payload.email}")
            
        if payload.full_name is not None:
            user.full_name = payload.full_name
            print(f"Nome atualizado para: {payload.full_name}")
            
        if payload.birth_date is not None:
            user.birth_date = payload.birth_date
            print(f"Data de nascimento atualizada para: {payload.birth_date}")
            
        if payload.judge_level is not None:
            user.judge_level = payload.judge_level
            print(f"Nível de juiz atualizado para: {payload.judge_level}")
            
        if payload.judge_since is not None:
            user.judge_since = payload.judge_since
            print(f"Ano de início como juiz atualizado para: {payload.judge_since}")
            
        if payload.password is not None:
            user.set_password(payload.password.get_secret_value())
            print("Senha atualizada")
        
        user.save()
        print(f"Usuário {user.id} atualizado com sucesso")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_judge": user.is_judge,
            "created_at": user.created_at,
            "full_name": user.full_name,
            "birth_date": user.birth_date,
            "judge_level": user.judge_level,
            "judge_since": user.judge_since
        }
        
    except Exception as e:
        print(f"Erro ao atualizar usuário: {str(e)}")
        raise e

# Category endpoints
@api.get("/categories", response=List[CategorySchema], auth=JWTAuth())
def list_categories(request):
    return Category.objects.all()

@api.get("/categories/{category_id}", response={200: CategorySchema, 404: dict}, auth=JWTAuth())
def get_category(request, category_id: str):
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
def update_category(request, category_id: str, payload: CategoryCreateSchema):
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
def delete_category(request, category_id: str):
    try:
        category = get_object_or_404(Category, category_id=category_id)
        category.delete()
        return 200, {"success": True}
    except Category.DoesNotExist:
        return 404, {"error": f"Category with ID '{category_id}' not found"}

# Program endpoints
@api.get("/programs", response=List[ProgramSchema], auth=JWTAuth())
def list_programs(request):
    programs = Program.objects.all()
    return [{
        "programId": p.program_id,
        "name": p.name,
        "equipageId": p.equipage_id,
        "videoPath": p.video_path,
        "exercises": [int(x.strip()) for x in p.exercise_order.split(',')] if p.exercise_order else []
    } for p in programs]

@api.get("/programs/{program_id}", response=ProgramDetailSchema, auth=JWTAuth())
def get_program(request, program_id: int):
    program = get_object_or_404(Program, program_id=program_id)
    return {
        "programId": program.program_id,
        "name": program.name,
        "equipageId": program.equipage_id,
        "videoPath": program.video_path,
        "exercises": [int(x.strip()) for x in program.exercise_order.split(',')] if program.exercise_order else []
    }

@api.post("/programs", response=ProgramSchema, auth=JWTAuth())
def create_program(request, payload: ProgramCreateSchema):
    program_data = payload.dict(by_alias=True)
    exercises = program_data.pop('exercises', [])
    exercise_order = ','.join(map(str, exercises))
    program = Program.objects.create(**program_data, exercise_order=exercise_order)
    if exercises:
        program.exercises.set(exercises)
    return {
        "programId": program.program_id,
        "name": program.name,
        "equipageId": program.equipage_id,
        "videoPath": program.video_path,
        "exercises": exercises
    }

@api.put("/programs/{program_id}", response=ProgramSchema, auth=JWTAuth())
def update_program(request, program_id: int, payload: ProgramCreateSchema):
    program = get_object_or_404(Program, program_id=program_id)
    program_data = payload.dict(by_alias=True)
    exercises = program_data.pop('exercises', [])
    exercise_order = ','.join(map(str, exercises))
    
    for attr, value in program_data.items():
        setattr(program, attr, value)
    program.exercise_order = exercise_order
    program.save()
    
    if exercises:
        program.exercises.set(exercises)
    
    return {
        "programId": program.program_id,
        "name": program.name,
        "equipageId": program.equipage_id,
        "videoPath": program.video_path,
        "exercises": exercises
    }

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
def list_exercises_by_category(request, category_id: str):
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

# ProgramScore endpoints
@api.get("/program-scores", response=List[ProgramScoreSchema], auth=JWTAuth())
def list_program_scores(request):
    return ProgramScore.objects.all()

@api.get("/program-scores/program/{program_id}", response=List[ProgramScoreSchema], auth=JWTAuth())
def list_program_scores_by_program(request, program_id: int):
    return ProgramScore.objects.filter(program_id=program_id)

@api.get("/program-scores/exercise/{exercise_id}", response=List[ProgramScoreSchema], auth=JWTAuth())
def list_program_scores_by_exercise(request, exercise_id: int):
    return ProgramScore.objects.filter(exercise_id=exercise_id)

@api.get("/program-scores/{program_score_id}", response=ProgramScoreSchema, auth=JWTAuth())
def get_program_score(request, program_score_id: int):
    return get_object_or_404(ProgramScore, program_score_id=program_score_id)

@api.post("/program-scores", response=ProgramScoreSchema, auth=JWTAuth())
def create_program_score(request, payload: ProgramScoreCreateSchema):
    program_score = ProgramScore.objects.create(**payload.dict())
    return program_score

@api.put("/program-scores/{program_score_id}", response=ProgramScoreSchema, auth=JWTAuth())
def update_program_score(request, program_score_id: int, payload: ProgramScoreCreateSchema):
    program_score = get_object_or_404(ProgramScore, program_score_id=program_score_id)
    for attr, value in payload.dict().items():
        setattr(program_score, attr, value)
    program_score.save()
    return program_score

@api.delete("/program-scores/{program_score_id}", auth=JWTAuth())
def delete_program_score(request, program_score_id: int):
    program_score = get_object_or_404(ProgramScore, program_score_id=program_score_id)
    program_score.delete()
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
        "details": user_session.details,
        "scores": scores
    }

@api.post("/user-sessions", response=UserSessionSchema, auth=JWTAuth())
def create_user_session(request, payload: UserSessionCreateSchema):
    data = payload.dict() 
    user_session = UserSession.objects.create(
        user=request.user,
        program_id=data.get('program_id'),  # Usar dict para maior compatibilidade
        details=data.get('details')
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
    return UserScore.objects.filter(user_session_id=user_session_id)

@api.get("/user-scores/{user_score_id}", response=UserScoreSchema, auth=JWTAuth())
def get_user_score(request, user_score_id: int):
    user_score = get_object_or_404(UserScore, user_score_id=user_score_id)
    user_session = user_score.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    return user_score

@api.post("/user-scores", response=UserScoreSchema, auth=JWTAuth())
def create_user_score(request, payload: UserScoreCreateSchema):
    data = payload.dict()
    user_session = get_object_or_404(UserSession, user_session_id=data.get('user_session_id'))
    
    # Ensure the user owns this session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    
    # Create the user score
    user_score = UserScore.objects.create(**data)
    return user_score

@api.delete("/user-scores/{user_score_id}", auth=JWTAuth())
def delete_user_score(request, user_score_id: int):
    user_score = get_object_or_404(UserScore, user_score_id=user_score_id)
    user_session = user_score.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    user_score.delete()
    return {"success": True}

# Analytics endpoints
@api.get("/analytics/user-performance", auth=JWTAuth())
def user_performance(request):
    # Get all user sessions
    user_sessions = UserSession.objects.filter(user=request.user)
    
    # Calculate performance metrics
    total_sessions = user_sessions.count()
    total_exercises = UserScore.objects.filter(user_session__in=user_sessions).count()
    
    if total_exercises == 0:
        return {
            "total_sessions": total_sessions,
            "total_exercises": 0,
            "average_score": 0,
            "best_category": None,
            "worst_category": None
        }
    
    # Calculate average score
    average_score = UserScore.objects.filter(
        user_session__in=user_sessions
    ).aggregate(avg_score=models.Avg('user_score'))['avg_score']
    
    # Get best and worst categories
    category_scores = {}
    for score in UserScore.objects.filter(user_session__in=user_sessions):
        exercise = score.program_score.exercise
        if exercise.category_id not in category_scores:
            category_scores[exercise.category_id] = []
        category_scores[exercise.category_id].append(score.user_score)
    
    best_category = None
    worst_category = None
    best_avg = 0
    worst_avg = float('inf')
    
    for category_id, scores in category_scores.items():
        avg = sum(scores) / len(scores)
        if avg > best_avg:
            best_avg = avg
            best_category = category_id
        if avg < worst_avg:
            worst_avg = avg
            worst_category = category_id
    
    return {
        "total_sessions": total_sessions,
        "total_exercises": total_exercises,
        "average_score": average_score,
        "best_category": best_category,
        "worst_category": worst_category
    }
