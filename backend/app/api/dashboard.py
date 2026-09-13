from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dashboard.dashboard_service import get_dashboard_summary

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db)