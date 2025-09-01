from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi.staticfiles import StaticFiles
from jose import JWTError
from jose import jwt
from sqlalchemy.orm import Session as SQLAlchemySession
import models
from database import get_db, Base, engine
import os

app = FastAPI()

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("avatars", exist_ok=True)  # Ensure folder exists
app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")



SECRET_KEY = os.getenv("SECRET_KEY", "dc2cbe5e050232a1458d48c43328650ec84fbb4a0d91dd4cca9e6464d90fcd5b")  
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_user_by_email(db: SQLAlchemySession, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: SQLAlchemySession, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: SQLAlchemySession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user

# Pydantic models
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

# API routes

@app.post("/signup", response_model=UserOut)
async def signup(user: UserIn, db: SQLAlchemySession = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        name=user.name,
        email=user.email,
        password=hashed_password,
        avatar=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserOut(
        username=new_user.username,
        email=new_user.email,
        name=new_user.name,
        avatar=new_user.avatar
    )

@app.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: SQLAlchemySession = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile", response_model=UserOut)
async def get_profile(current_user: models.User = Depends(get_current_user)):
    return UserOut(
        username=current_user.username,
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar
    )

@app.put("/profile", response_model=UserOut)
async def update_profile(
    name: str = Form(...),
    email: str = Form(...),
    avatar: UploadFile | None = File(None),
    current_user: models.User = Depends(get_current_user),
    db: SQLAlchemySession = Depends(get_db)
):
    user = current_user
    user.name = name
    user.email = email

    if avatar:
        os.makedirs("avatars", exist_ok=True)
        filename = f"{user.id}_{avatar.filename}"
        filepath = os.path.join("avatars", filename)
        contents = await avatar.read()
        with open(filepath, "wb") as f:
            f.write(contents)
        user.avatar = filename

    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        username=user.username,
        email=user.email,
        name=user.name,
        avatar=user.avatar
    )
startup_event()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)






# from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.security import OAuth2PasswordBearer
# from pydantic import BaseModel
# from datetime import datetime, timedelta
# from typing import Optional
# from passlib.context import CryptContext
# from fastapi.staticfiles import StaticFiles
# from jose import JWTError
# import jwt
# from sqlalchemy.orm import Session as SQLAlchemySession
# import models
# from database import get_db, Base, engine
# import os

# app = FastAPI()

# # CORS setup
# origins = ["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,  # Fix here: must be bool
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# os.makedirs("avatars", exist_ok=True)  # Ensure folder exists
# app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")

# def create_tables():
#     Base.metadata.create_all(bind=engine)

# # JWT & security setup
# SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Provide fallback for dev
# ALGORITHM = os.getenv("ALGORITHM", "HS256")
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# def verify_password(plain_password: str, hashed_password: str):
#     return pwd_context.verify(plain_password, hashed_password)

# def get_password_hash(password: str):
#     return pwd_context.hash(password)

# def create_access_token(data: dict, expires_delta: timedelta | None = None):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt

# def decode_access_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         return None

# def get_user_by_email(db: SQLAlchemySession, email: str):
#     return db.query(models.User).filter(models.User.email == email).first()

# def get_user_by_username(db: SQLAlchemySession, username: str):
#     return db.query(models.User).filter(models.User.username == username).first()

# async def get_current_user(token: str = Depends(oauth2_scheme), db: SQLAlchemySession = Depends(get_db)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     payload = decode_access_token(token)
#     if payload is None:
#         raise credentials_exception
#     email: str = payload.get("sub")
#     if email is None:
#         raise credentials_exception
#     user = get_user_by_email(db, email)
#     if user is None:
#         raise credentials_exception
#     return user

# # Pydantic models
# class UserIn(BaseModel):
#     username: str
#     name: str
#     email: str
#     password: str

# class UserLogin(BaseModel):
#     email: str
#     password: str

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class UserOut(BaseModel):
#     username: str
#     email: str
#     name: str
#     avatar: Optional[str] = None

# # API routes

# @app.post("/signup", response_model=UserOut)
# async def signup(user: UserIn, db: SQLAlchemySession = Depends(get_db)):
#     # Check duplicate email or username
#     db_user = db.query(models.User).filter(
#         (models.User.email == user.email) | (models.User.username == user.username)
#     ).first()
#     if db_user:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email or username already registered"
#         )
#     hashed_password = get_password_hash(user.password)
#     new_user = models.User(
#         username=user.username,
#         name=user.name,
#         email=user.email,
#         password=hashed_password,
#         avatar=None
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)

#     return UserOut(
#         username=new_user.username,
#         email=new_user.email,
#         name=new_user.name,
#         avatar=new_user.avatar
#     )

# @app.post("/login", response_model=Token)
# async def login(user_in: UserLogin, db: SQLAlchemySession = Depends(get_db)):
#     user = get_user_by_email(db, user_in.email)
#     if not user or not verify_password(user_in.password, user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.email}, expires_delta=access_token_expires
#     )
#     return {"access_token": access_token, "token_type": "bearer"}

# @app.get("/profile", response_model=UserOut)
# async def get_profile(current_user: models.User = Depends(get_current_user)):
#     return UserOut(
#         username=current_user.username,
#         email=current_user.email,
#         name=current_user.name,
#         avatar=current_user.avatar
#     )

# @app.put("/profile", response_model=UserOut)
# async def update_profile(
#     name: str = Form(...),
#     email: str = Form(...),
#     avatar: UploadFile | None = File(None),
#     current_user: models.User = Depends(get_current_user),
#     db: SQLAlchemySession = Depends(get_db)
# ):
#     user = current_user
#     user.name = name
#     user.email = email

#     if avatar:
#         # Save avatar file
#         os.makedirs("avatars", exist_ok=True)
#         filename = f"{user.id}_{avatar.filename}"
#         filepath = os.path.join("avatars", filename)
#         contents = await avatar.read()
#         with open(filepath, "wb") as f:
#             f.write(contents)
#         user.avatar = filename

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     return UserOut(
#         username=user.username,
#         email=user.email,
#         name=user.name,
#         avatar=user.avatar
#     )

# if __name__ == "__main__":
#     create_tables()
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
