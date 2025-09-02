from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as SQLAlchemySession
import models
from database import get_db, Base, engine
import os
from pydantic_models import UserIn, UserLogin, UserOut, Token 
from UserAuthMethods import get_password_hash, verify_password, get_current_user, get_user_by_email, get_user_by_username, create_access_token, decode_access_token
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

os.makedirs("avatars", exist_ok=True) 
app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")

ACCESS_TOKEN_EXPIRE_MINUTES = 30


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
    print("Login")
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





