from ninja import Schema
from typing import List, Optional
from pydantic import BaseModel, EmailStr, SecretStr, Field
from datetime import datetime, date

class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: SecretStr
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    judge_level: Optional[str] = None
    judge_since: Optional[int] = None

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    isJudge: bool = Field(alias='is_judge')
    createdAt: datetime = Field(alias='created_at')
    fullName: Optional[str] = Field(alias='full_name', default=None)
    birthDate: Optional[date] = Field(alias='birth_date', default=None)
    judgeLevel: Optional[str] = Field(alias='judge_level', default=None)
    judgeSince: Optional[int] = Field(alias='judge_since', default=None)

    class Config:
        from_attributes = True
        populate_by_name = True

class UserUpdateSchema(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    judge_level: Optional[str] = None
    judge_since: Optional[int] = None
    password: Optional[SecretStr] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

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
    program_id: int
    details: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class UserSessionDetailSchema(BaseModel):
    userSessionId: int = Field(alias='user_session_id')
    userId: int = Field(alias='user_id')
    programId: int = Field(alias='program_id')
    timestamp: datetime
    programName: str = Field(alias='program_name')
    details: Optional[str] = None
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
    user_session_id: int
    correct_score_id: int
    user_score: float
    exercise_name: Optional[str] = None
    expert_score: Optional[float] = None

    class Config:
        from_attributes = True
        populate_by_name = True