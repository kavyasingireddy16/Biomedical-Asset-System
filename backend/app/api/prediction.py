from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.prediction import PredictionRequest
from app.schemas.predict_asset import AssetPredictionRequest

from app.services.prediction_service import predict_failure
from app.services.gemini_service import generate_ai_recommendation
from app.services.asset_prediction_service import predict_asset_failure

router = APIRouter(
    prefix="/prediction",
    tags=["AI Prediction"]
)


# -------------------------------------------------------
# Manual Prediction
# -------------------------------------------------------
@router.post("/")
def predict(request: PredictionRequest):

    prediction = predict_failure(
        request.asset_type,
        request.manufacturer,
        request.department,
        request.asset_age,
        request.usage_hours,
        request.maintenance_count,
        request.maintenance_cost,
        request.breakdown_count,
        request.last_service_days,
        request.status,
        request.warranty
    )

    asset_data = {
        "asset_type": request.asset_type,
        "manufacturer": request.manufacturer,
        "department": request.department,
        "asset_age": request.asset_age,
        "usage_hours": request.usage_hours,
        "maintenance_count": request.maintenance_count,
        "maintenance_cost": request.maintenance_cost,
        "breakdown_count": request.breakdown_count,
        "last_service_days": request.last_service_days,
        "status": request.status,
        "warranty": request.warranty
    }

    ai_analysis = generate_ai_recommendation(
        asset_data,
        prediction
    )

    prediction["ai_analysis"] = ai_analysis

    return prediction


# -------------------------------------------------------
# Predict By Asset ID
# -------------------------------------------------------
@router.post("/by-asset")
def predict_by_asset(
    request: AssetPredictionRequest,
    db: Session = Depends(get_db)
):

    result = predict_asset_failure(
        request.asset_id,
        db
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return result