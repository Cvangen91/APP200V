from ninja import Schema
from pydantic import Field, SecretStr, EmailStr

class UserCreateSchema(Schema):
    username: str = Field(..., min_length=3, max_length=150)
    email: EmailStr = Field(...)
    password: SecretStr = Field(..., min_length=8)

class UserLoginSchema(Schema):
    username: str
    password: SecretStr
