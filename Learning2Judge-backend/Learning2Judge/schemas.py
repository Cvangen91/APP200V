from typing import List, Optional
from ninja import Schema
from pydantic import SecretStr
from datetime import datetime

class UserCreateSchema(Schema):
    username: str
    email: str
    password: SecretStr

class UserSchema(Schema):
    id: int
    username: str
    email: str
    is_judge: bool
    created_at: datetime

class UserUpdateSchema(Schema):
    email: Optional[str]
    is_judge: Optional[bool]

class UserLoginSchema(Schema):
    username: str
    password: str

class CategorySchema(Schema):
    category_id: int  # Changed to integer
    name: str

class CategoryCreateSchema(Schema):
    name: str

class ProgramSchema(Schema):
    program_id: int  # Changed to integer
    name: str
    description: Optional[str] = None
    equipage_id: Optional[int] = None  # Changed to integer

class ProgramCreateSchema(Schema):
    name: str
    description: Optional[str] = None
    equipage_id: Optional[int] = None  # Changed to integer

class ProgramDetailSchema(Schema):
    program_id: int
    name: str
    description: Optional[str]
    equipage_id: Optional[int]
    exercises: List[int]  # List of exercise IDs

class ExerciseSchema(Schema):
    exercise_id: int  # Changed to integer
    name: str
    category_id: int

class ExerciseCreateSchema(Schema):
    name: str
    category_id: int
    description: Optional[str]

class CorrectScoreSchema(Schema):
    correct_score_id: int  # Changed to integer
    correct_score: float
    execution_number: int
    exercise_id: int
    program_id: int  # Changed to integer

class CorrectScoreCreateSchema(Schema):
    correct_score: float
    execution_number: int
    exercise_id: int
    program_id: int  # Changed to integer

class UserSessionSchema(Schema):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: str

class UserSessionCreateSchema(Schema):
    program_id: int

class UserSessionDetailSchema(Schema):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: str
    program_name: str
    scores: List['UserScoreSchema']  # List of user scores

class UserScoreSchema(Schema):
    user_score_id: int
    user_session_id: int
    correct_score_id: int
    user_score: float

class UserScoreCreateSchema(Schema):
    user_session_id: int
    correct_score_id: int
    user_score: float