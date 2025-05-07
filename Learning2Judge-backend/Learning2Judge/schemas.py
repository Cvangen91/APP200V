from ninja import Schema
from typing import List, Optional
from pydantic import BaseModel, EmailStr, SecretStr
from datetime import datetime

class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: SecretStr

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    is_judge: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdateSchema(BaseModel):
    email: Optional[EmailStr] = None

class UserLoginSchema(BaseModel):
    username: str
    password: str

class CategorySchema(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None

class ProgramSchema(BaseModel):
    program_id: int
    name: str
    equipage_id: Optional[int] = None
    video_path: Optional[str] = None
    exercises: List[int] = []

    class Config:
        from_attributes = True

class ProgramCreateSchema(BaseModel):
    name: str
    equipage_id: Optional[int] = None
    video_path: Optional[str] = None
    exercises: List[int] = []

class ProgramDetailSchema(BaseModel):
    program_id: int
    name: str
    equipage_id: Optional[int] = None
    video_path: Optional[str] = None
    exercises: List[int]

class ExerciseSchema(BaseModel):
    exercise_id: int
    category_id: int
    name: str

    class Config:
        from_attributes = True

class ExerciseCreateSchema(BaseModel):
    category_id: int
    name: str

class ProgramScoreSchema(BaseModel):
    program_score_id: int
    program_id: int
    exercise_id: int
    score: float

    class Config:
        from_attributes = True

class ProgramScoreCreateSchema(BaseModel):
    program_id: int
    exercise_id: int
    score: float

class UserSessionSchema(BaseModel):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class UserSessionCreateSchema(BaseModel):
    program_id: int

class UserSessionDetailSchema(BaseModel):
    user_session_id: int
    user_id: int
    program_id: int
    timestamp: datetime
    program_name: str
    scores: List['UserScoreSchema']

class UserScoreSchema(BaseModel):
    user_score_id: int
    user_session_id: int
    correct_score_id: int
    user_score: float
    timestamp: datetime

    class Config:
        from_attributes = True

class UserScoreCreateSchema(BaseModel):
    user_session_id: int
    correct_score_id: int
    user_score: float