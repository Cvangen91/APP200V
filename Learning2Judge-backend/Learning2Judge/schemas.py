from ninja import Schema
from pydantic import Field, SecretStr, EmailStr
from typing import Optional
from datetime import datetime

class UserCreateSchema(Schema):
    username: str = Field(..., min_length=3, max_length=150)
    email: EmailStr = Field(...)
    password: SecretStr = Field(..., min_length=8)

class UserLoginSchema(Schema):
    username: str
    password: SecretStr

# Category schemas
class CategorySchema(Schema):
    category_id: int
    name: str

class CategoryCreateSchema(Schema):
    name: str

# Program schemas
class ProgramSchema(Schema):
    program_id: int
    name: str
    description: Optional[str] = None

class ProgramCreateSchema(Schema):
    name: str
    description: Optional[str] = None

# Exercise schemas
class ExerciseSchema(Schema):
    exercise_id: int
    name: str
    category_id: int
    description: Optional[str] = None
    correct_score: float

class ExerciseCreateSchema(Schema):
    name: str
    category_id: int
    description: Optional[str] = None
    correct_score: float

# UserSession schemas
class UserSessionSchema(Schema):
    user_session_id: int
    user_id: int
    program_id: int
    start_time: datetime

class UserSessionCreateSchema(Schema):
    user_id: int
    program_id: int

# UserResult schemas
class UserResultSchema(Schema):
    user_result_id: int
    user_session_id: int
    exercise_id: int
    user_answer: float
    percent_correct: float

class UserResultCreateSchema(Schema):
    user_session_id: int
    exercise_id: int
    user_answer: float
    percent_correct: float
