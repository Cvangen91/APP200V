from ninja import Schema
from pydantic import Field, SecretStr


class UserCreateSchema(Schema):
    username: str = Field(..., min_length=3)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: SecretStr = Field(..., min_length=8)


class UserLoginSchema(Schema):
    username: str
    password: SecretStr
