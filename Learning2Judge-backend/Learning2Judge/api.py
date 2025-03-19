from ninja import NinjaAPI, Router
from django.contrib.auth import authenticate
from ninja_extra import NinjaExtraAPI
from django.shortcuts import get_object_or_404
from typing import List
from .models import User, Category, Program, Exercise, UserSession, UserResult
from .schemas import (
    UserCreateSchema, UserLoginSchema, CategorySchema, CategoryCreateSchema,
    ProgramSchema, ProgramCreateSchema, ExerciseSchema, ExerciseCreateSchema,
    UserSessionSchema, UserSessionCreateSchema, UserResultSchema, UserResultCreateSchema
)
from ninja.security import HttpBearer
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

@api.post("/register", auth=None)
def register_user(request, payload: UserCreateSchema):
    if User.objects.filter(username=payload.username).exists():
        return api.create_response(request, {"error": "Username already registered"}, status=400)

    if User.objects.filter(email=payload.email).exists():
        return api.create_response(request, {"error": "Email already registered"}, status=400)

    try:
        user = User.objects.create_user(
            username=payload.username,
            email=payload.email,
            password=payload.password.get_secret_value(),
        )
    except Exception as e:
        return api.create_response(request, {"error": str(e)}, status=500)

    return api.create_response(
        request,
        {
            "id": user.id,
            "username": user.username,
            "message": "User created successfully",
        },
        status=201
    )

# Category endpoints
@api.get("/categories", response=List[CategorySchema], auth=JWTAuth())
def list_categories(request):
    return Category.objects.all()

@api.get("/categories/{category_id}", response=CategorySchema, auth=JWTAuth())
def get_category(request, category_id: int):
    return get_object_or_404(Category, category_id=category_id)

@api.post("/categories", response=CategorySchema, auth=JWTAuth())
def create_category(request, payload: CategoryCreateSchema):
    category = Category.objects.create(**payload.dict())
    return category

@api.put("/categories/{category_id}", response=CategorySchema, auth=JWTAuth())
def update_category(request, category_id: int, payload: CategoryCreateSchema):
    category = get_object_or_404(Category, category_id=category_id)
    for attr, value in payload.dict().items():
        setattr(category, attr, value)
    category.save()
    return category

@api.delete("/categories/{category_id}", auth=JWTAuth())
def delete_category(request, category_id: int):
    category = get_object_or_404(Category, category_id=category_id)
    category.delete()
    return {"success": True}

# Program endpoints
@api.get("/programs", response=List[ProgramSchema], auth=JWTAuth())
def list_programs(request):
    return Program.objects.all()

@api.get("/programs/{program_id}", response=ProgramSchema, auth=JWTAuth())
def get_program(request, program_id: int):
    return get_object_or_404(Program, program_id=program_id)

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
def list_exercises_by_category(request, category_id: int):
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

# UserSession endpoints
@api.get("/user-sessions", response=List[UserSessionSchema], auth=JWTAuth())
def list_user_sessions(request):
    return UserSession.objects.filter(user=request.user)

@api.get("/user-sessions/{user_session_id}", response=UserSessionSchema, auth=JWTAuth())
def get_user_session(request, user_session_id: int):
    return get_object_or_404(UserSession, user_session_id=user_session_id, user=request.user)

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

# UserResult endpoints
@api.get("/user-results/session/{user_session_id}", response=List[UserResultSchema], auth=JWTAuth())
def list_user_results_by_session(request, user_session_id: int):
    user_session = get_object_or_404(UserSession, user_session_id=user_session_id, user=request.user)
    return UserResult.objects.filter(user_session=user_session)

@api.get("/user-results/{user_result_id}", response=UserResultSchema, auth=JWTAuth())
def get_user_result(request, user_result_id: int):
    user_result = get_object_or_404(UserResult, user_result_id=user_result_id)
    user_session = user_result.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    return user_result

@api.post("/user-results", response=UserResultSchema, auth=JWTAuth())
def create_user_result(request, payload: UserResultCreateSchema):
    user_session = get_object_or_404(UserSession, user_session_id=payload.user_session_id)
    
    # Ensure the user owns this session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    
    # Create the user result
    user_result = UserResult.objects.create(**payload.dict())
    return user_result

@api.delete("/user-results/{user_result_id}", auth=JWTAuth())
def delete_user_result(request, user_result_id: int):
    user_result = get_object_or_404(UserResult, user_result_id=user_result_id)
    # Check if user has permission (is the owner of the session)
    user_session = user_result.user_session
    if user_session.user != request.user:
        return api.create_response(request, {"error": "Permission denied"}, status=403)
    user_result.delete()
    return {"success": True}
