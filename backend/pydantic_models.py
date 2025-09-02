# Pydantic models
from pydantic import BaseModel
from typing import Optional


class UserIn(BaseModel):
    username: str
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    username: str
    email: str
    name: str
    avatar: Optional[str] = None
