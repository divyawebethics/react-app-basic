# create_engine is the starting point for connection.
# Declarative base creates a base class object for defining database tables and their corresponding classes.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
## define database url
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://divya:Divya%402025@localhost/person"
# create engine takes database url and return and engine instance 
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, echo = True
)

## SessionLocal class and this class will be a database session.

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()