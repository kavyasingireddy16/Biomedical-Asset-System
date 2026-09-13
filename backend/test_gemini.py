from app.services.gemini_service import generate_ai_recommendation

asset = {
    "asset_type": "Ventilator",
    "manufacturer": "Philips",
    "department": "ICU",
    "asset_age": 7,
    "usage_hours": 18000,
    "maintenance_count": 8,
    "maintenance_cost": 9000,
    "breakdown_count": 5,
    "last_service_days": 180,
    "status": "Under Maintenance",
    "warranty": "No"
}

prediction = {
    "failure_risk": "High Risk",
    "probability": 0.98
}

print(generate_ai_recommendation(asset, prediction))