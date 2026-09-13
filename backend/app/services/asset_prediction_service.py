from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.services.prediction_service import predict_failure
from app.services.gemini_service import generate_ai_recommendation


def predict_asset_failure(asset_id: int, db: Session):

    asset = (
        db.query(Asset)
        .filter(Asset.asset_id == asset_id)
        .first()
    )

    if asset is None:
        return None

    prediction = predict_failure(
        asset.asset_type,
        asset.manufacturer,
        asset.department,
        asset.asset_age,
        asset.usage_hours,
        asset.maintenance_count,
        asset.maintenance_cost,
        asset.breakdown_count,
        asset.last_service_days,
        asset.status,
        asset.warranty
    )

    ai_analysis = generate_ai_recommendation(
        asset,
        prediction
    )

    prediction["asset_id"] = asset.asset_id
    prediction["asset_name"] = asset.asset_name
    prediction["ai_analysis"] = ai_analysis

    return prediction