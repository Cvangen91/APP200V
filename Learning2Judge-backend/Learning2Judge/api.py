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
