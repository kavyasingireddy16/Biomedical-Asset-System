from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
from urllib.parse import quote_plus
import os
from pathlib import Path

# Load .env file explicitly from backend folder
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# Read values from .env
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")

# Encode password to handle special characters like @, #, %, etc.
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))

# Print values for debugging
print("DB_HOST =", repr(DB_HOST))
print("DB_PORT =", repr(DB_PORT))
print("DB_NAME =", repr(DB_NAME))
print("DB_USER =", repr(DB_USER))
print("DB_PASSWORD =", repr(DB_PASSWORD))

# MySQL Connection URL
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

print("DATABASE_URL =", DATABASE_URL)

# Create Engine
engine = create_engine(
    DATABASE_URL,
    echo=True
)

# Create Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base Class
Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()