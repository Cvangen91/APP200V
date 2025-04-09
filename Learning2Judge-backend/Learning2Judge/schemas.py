from ninja import Schema
from pydantic import Field, SecretStr, EmailStr
from typing import Optional, List
from datetime import datetime, date

class UserCreateSchema(Schema):
    username: str = Field(..., min_length=3, max_length=150)
    email: EmailStr = Field(...)
    password: SecretStr = Field(..., min_length=8)
    birthdate: Optional[date] = None

class UserSchema(Schema):
    id: int
    username: str
    email: str
    birthdate: Optional[date] = None
    is_judge: bool

class UserUpdateSchema(Schema):
    email: Optional[EmailStr] = None
    birthdate: Optional[date] = None

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
    equipage_id: Optional[int] = None

class ProgramCreateSchema(Schema):
    name: str
    description: Optional[str] = None
    equipage_id: Optional[int] = None

# Exercise schemas
class ExerciseSchema(Schema):
    exercise_id: int
    name: str
    category_id: int
    description: Optional[str] = None

class ExerciseCreateSchema(Schema):
    name: str
    category_id: int
    description: Optional[str] = None

# CorrectScore schemas
class CorrectScoreSchema(Schema):
    correct_score_id: int
    correct_score: float
    execution_number: int
    exercise_id: int
    program_id: int

class CorrectScoreCreateSchema(Schema):
    correct_score: float
    execution_number: int
    exercise_id: int
    program_id: int

# UserSession schemas
class UserSessionSchema(Schema):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: datetime

class UserSessionCreateSchema(Schema):
    program_id: int

# UserScore schemas
class UserScoreSchema(Schema):
    user_score_id: int
    user_session_id: int
    correct_score_id: int
    user_score: float

class UserScoreCreateSchema(Schema):
    user_session_id: int
    correct_score_id: int
    user_score: float

# Summary schemas for better API responses
class UserSessionDetailSchema(Schema):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: datetime
    program_name: str
    scores: List[UserScoreSchema]

class ProgramDetailSchema(Schema):
    program_id: int
    name: str
    description: Optional[str] = None
    equipage_id: Optional[int] = None
    exercises: List[int]  # List of exercise IDs included in the program
