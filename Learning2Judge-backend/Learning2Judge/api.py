from ninja import NinjaAPI, Router
from django.contrib.auth import authenticate
from ninja_extra import NinjaExtraAPI
from .models import User
from .schemas import UserCreateSchema, UserLoginSchema
from ninja.security import HttpBearer
from ninja_jwt.controller import NinjaJWTDefaultController

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


@api.post("/register", auth=None)
def register_user(request, payload: UserCreateSchema):
    if User.objects.filter(username=payload.username).exists():
        return {"error": "Username already registered"}

    if User.objects.filter(email=payload.email).exists():
        return {"error": "Email already registered"}

    user = User.objects.create_user(
        username=payload.username,
        email=payload.email,
        password=payload.password.get_secret_value(),
    )

    return {
        "id": user.id,
        "username": user.username,
        "message": "User created successfully",
    }


@api.post("/login", auth=None)
def login_user(request, payload: UserLoginSchema):
    user = authenticate(
        username=payload.username, password=payload.password.get_secret_value()
    )

    if user:
        return {
            "detail": "Authentication successful (use JWT endpoints for actual token)"
        }
    return {"error": "Invalid credentials"}
