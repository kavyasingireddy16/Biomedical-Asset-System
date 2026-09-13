import joblib
import pandas as pd
import tensorflow as tf

# -----------------------------
# Load Deep Learning Model
# -----------------------------
model = tf.keras.models.load_model("ml/failure_model.keras")

# -----------------------------
# Load Encoders
# -----------------------------
asset_encoder = joblib.load("ml/asset_encoder.pkl")
manufacturer_encoder = joblib.load("ml/manufacturer_encoder.pkl")
department_encoder = joblib.load("ml/department_encoder.pkl")
status_encoder = joblib.load("ml/status_encoder.pkl")
warranty_encoder = joblib.load("ml/warranty_encoder.pkl")

# -----------------------------
# Load Scaler
# -----------------------------
scaler = joblib.load("ml/scaler.pkl")


def predict_failure(
    asset_type,
    manufacturer,
    department,
    asset_age,
    usage_hours,
    maintenance_count,
    maintenance_cost,
    breakdown_count,
    last_service_days,
    status,
    warranty
):

    # Encode categorical values
    asset_type = asset_encoder.transform([asset_type])[0]
    manufacturer = manufacturer_encoder.transform([manufacturer])[0]
    department = department_encoder.transform([department])[0]
    status = status_encoder.transform([status])[0]
    warranty = warranty_encoder.transform([warranty])[0]

    # Create DataFrame
    input_data = pd.DataFrame([{
        "asset_type": asset_type,
        "manufacturer": manufacturer,
        "department": department,
        "asset_age": asset_age,
        "usage_hours": usage_hours,
        "maintenance_count": maintenance_count,
        "maintenance_cost": maintenance_cost,
        "breakdown_count": breakdown_count,
        "last_service_days": last_service_days,
        "status": status,
        "warranty": warranty
    }])

    # Scale input
    input_scaled = scaler.transform(input_data)

    # -----------------------------
    # Deep Learning Prediction
    # -----------------------------
    model_probability = float(
        model.predict(input_scaled, verbose=0)[0][0]
    )

    # -----------------------------
    # Maintenance Condition Risk Adjustment
    # -----------------------------
    risk_adjustment = 0.0

    # Previous breakdowns indicate increased equipment risk
    if breakdown_count >= 3:
        risk_adjustment += 0.25
    elif breakdown_count >= 1:
        risk_adjustment += 0.10

    # Long periods without service indicate maintenance overdue
    if last_service_days >= 180:
        risk_adjustment += 0.25
    elif last_service_days >= 90:
        risk_adjustment += 0.10

    # Older equipment receives additional risk
    if asset_age >= 10:
        risk_adjustment += 0.15
    elif asset_age >= 7:
        risk_adjustment += 0.10

    # High maintenance frequency can indicate repeated problems
    if maintenance_count >= 6:
        risk_adjustment += 0.10

    # Combine ML probability with engineering risk indicators
    probability = min(
        0.99,
        model_probability + risk_adjustment
    )

    # -----------------------------
    # Prediction Classification
    # -----------------------------
    prediction = 1 if probability >= 0.5 else 0

    # -----------------------------
    # Health Score
    # -----------------------------
    health_score = max(
        0,
        int((1 - probability) * 100)
    )

    # -----------------------------
    # Risk Classification
    # -----------------------------
    if probability >= 0.80:
        risk = "High Risk"
        priority = "Critical"
        recommendation = "Immediate maintenance required."

    elif probability >= 0.50:
        risk = "Medium Risk"
        priority = "High"
        recommendation = "Schedule preventive maintenance."

    else:
        risk = "Low Risk"
        priority = "Normal"
        recommendation = "Equipment is operating normally."

    # -----------------------------
    # Remaining Useful Life
    # -----------------------------
    remaining_life_days = max(
        30,
        int((1 - probability) * 365)
    )

    return {
        "prediction": prediction,
        "failure_risk": risk,
        "probability": round(probability, 2),
        "health_score": health_score,
        "priority": priority,
        "estimated_remaining_life_days": remaining_life_days,
        "recommended_action": recommendation
    }