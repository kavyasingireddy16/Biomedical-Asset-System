from tensorflow.keras.models import load_model
import joblib
import numpy as np
import pandas as pd

model = load_model("ml/failure_model.keras")

asset_encoder = joblib.load("ml/asset_encoder.pkl")
manufacturer_encoder = joblib.load("ml/manufacturer_encoder.pkl")
department_encoder = joblib.load("ml/department_encoder.pkl")
status_encoder = joblib.load("ml/status_encoder.pkl")
warranty_encoder = joblib.load("ml/warranty_encoder.pkl")
scaler = joblib.load("ml/scaler.pkl")


def predict_probability(asset):

    df = pd.DataFrame([{
        "asset_type": asset_encoder.transform([asset.asset_type])[0],
        "manufacturer": manufacturer_encoder.transform([asset.manufacturer])[0],
        "department": department_encoder.transform([asset.department])[0],
        "asset_age": getattr(asset, "asset_age", 5),
        "usage_hours": getattr(asset, "usage_hours", 10000),
        "maintenance_count": getattr(asset, "maintenance_count", 2),
        "maintenance_cost": getattr(asset, "maintenance_cost", 1000),
        "breakdown_count": getattr(asset, "breakdown_count", 0),
        "last_service_days": getattr(asset, "last_service_days", 30),
        "status": status_encoder.transform([asset.status])[0],
        "warranty": warranty_encoder.transform(
            [getattr(asset, "warranty", "Yes")]
        )[0]
    }])

    X = scaler.transform(df)

    probability = float(model.predict(X, verbose=0)[0][0])

    return probability