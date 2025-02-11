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
        return {"error": "Username já registrado"}

    if User.objects.filter(email=payload.email).exists():
        return {"error": "Email já cadastrado"}

    user = User.objects.create_user(
        username=payload.username,
        email=payload.email,
        password=payload.password.get_secret_value(),
    )

    return {
        "id": user.id,
        "username": user.username,
        "message": "Usuário criado com sucesso",
    }


@api.post("/login", auth=None)
def login_user(request, payload: UserLoginSchema):
    user = authenticate(
        username=payload.username, password=payload.password.get_secret_value()
    )

    if user:
        return {
            "detail": "Autenticação bem-sucedida (use endpoints JWT para token real)"
        }
    return {"error": "Credenciais inválidas"}
