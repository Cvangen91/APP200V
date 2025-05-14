from ninja import Schema
from typing import List, Optional
from pydantic import BaseModel, EmailStr, SecretStr, Field
from datetime import datetime

class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: SecretStr

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    isJudge: bool = Field(alias='is_judge')
    createdAt: datetime = Field(alias='created_at')

    class Config:
        from_attributes = True
        populate_by_name = True

class UserUpdateSchema(BaseModel):
    email: Optional[EmailStr] = None

class UserLoginSchema(BaseModel):
    username: str
    password: str

class CategorySchema(BaseModel):
    categoryId: int = Field(alias='category_id')
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class CategoryCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None

class ProgramSchema(BaseModel):
    programId: int = Field(alias='program_id')
    name: str
    equipageId: Optional[str] = Field(alias='equipage_id', default=None)
    videoPath: Optional[str] = Field(alias='video_path', default=None)
    exercises: List[int] = []

    class Config:
        from_attributes = True
        populate_by_name = True

class ProgramCreateSchema(BaseModel):
    name: str
    equipageId: Optional[str] = Field(alias='equipage_id', default=None)
    videoPath: Optional[str] = Field(alias='video_path', default=None)
    exercises: List[int] = []

class ProgramDetailSchema(BaseModel):
    programId: int = Field(alias='program_id')
    name: str
    equipageId: Optional[str] = Field(alias='equipage_id', default=None)
    videoPath: Optional[str] = Field(alias='video_path', default=None)
    exercises: List[int]

    class Config:
        from_attributes = True
        populate_by_name = True

class ExerciseSchema(BaseModel):
    exerciseId: int = Field(alias='exercise_id')
    categoryId: int = Field(alias='category_id')
    name: str

    class Config:
        from_attributes = True
        populate_by_name = True

class ExerciseCreateSchema(BaseModel):
    categoryId: int = Field(alias='category_id')
    name: str

class ProgramScoreSchema(BaseModel):
    programScoreId: int = Field(alias='program_score_id')
    programId: int = Field(alias='program_id')
    exerciseId: int = Field(alias='exercise_id')
    score: float

    class Config:
        from_attributes = True
        populate_by_name = True

class ProgramScoreCreateSchema(BaseModel):
    programId: int = Field(alias='program_id')
    exerciseId: int = Field(alias='exercise_id')
    score: float

class UserSessionSchema(BaseModel):
    userSessionId: int = Field(alias='user_session_id')
    userId: int = Field(alias='user_id')
    programId: int = Field(alias='program_id')
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class UserSessionCreateSchema(BaseModel):
    programId: int = Field(alias='program_id')
    details: Optional[str] = None

class UserSessionDetailSchema(BaseModel):
    userSessionId: int = Field(alias='user_session_id')
    userId: int = Field(alias='user_id')
    programId: int = Field(alias='program_id')
    timestamp: datetime
    programName: str = Field(alias='program_name')
    scores: List['UserScoreSchema']

    class Config:
        from_attributes = True
        populate_by_name = True

class UserScoreSchema(BaseModel):
    userScoreId: int = Field(alias='user_score_id')
    userSessionId: int = Field(alias='user_session_id')
    correctScoreId: int = Field(alias='correct_score_id')
    userScore: float = Field(alias='user_score')
    exerciseName: Optional[str] = Field(alias='exercise_name', default=None)
    expertScore: Optional[float] = Field(alias='expert_score', default=None)
    timestamp: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class UserScoreCreateSchema(BaseModel):
    userSessionId: int = Field(alias='user_session_id')
    correctScoreId: int = Field(alias='correct_score_id')
    userScore: float = Field(alias='user_score')
    exerciseName: Optional[str] = Field(alias='exercise_name', default=None)
    expertScore: Optional[float] = Field(alias='expert_score', default=None)