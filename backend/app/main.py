from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.models.asset import Asset
from app.models.maintenance import Maintenance

from app.api.asset import router as asset_router
from app.api.maintenance import router as maintenance_router
from app.api.prediction import router as prediction_router
from app.api import dashboard


app = FastAPI(
    title="AI-Powered Predictive Biomedical Asset Management System",
    version="1.0.0"
)


# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Create Database Tables
# -----------------------------
Base.metadata.create_all(bind=engine)


# -----------------------------
# API Routers
# -----------------------------
app.include_router(asset_router)
app.include_router(maintenance_router)
app.include_router(prediction_router)
app.include_router(dashboard.router)


# -----------------------------
# Home
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "Welcome to AI-Powered Predictive Biomedical Asset Management System"
    }