from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.asset import Asset
from app.models.maintenance import Maintenance
from app.services.health_score import calculate_health_score
from app.dashboard.ai_dashboard import predict_probability


def get_dashboard_summary(db: Session):

    # -------------------------
    # Asset Statistics
    # -------------------------
    total_assets = db.query(Asset).count()

    working_assets = db.query(Asset).filter(
        Asset.status == "Working"
    ).count()

    maintenance_assets = db.query(Asset).filter(
        Asset.status == "Under Maintenance"
    ).count()

    out_of_service = db.query(Asset).filter(
        Asset.status == "Out of Service"
    ).count()

    # -------------------------
    # Maintenance Cost
    # -------------------------
    total_cost = db.query(
        func.sum(Maintenance.cost)
    ).scalar()

    if total_cost is None:
        total_cost = 0

    # -------------------------
    # Department Statistics
    # -------------------------
    department_stats = (
        db.query(
            Asset.department,
            func.count(Asset.asset_id)
        )
        .group_by(Asset.department)
        .all()
    )

    departments = {}

    for department, count in department_stats:
        departments[department] = count

    # -------------------------
    # Health Statistics
    # -------------------------
    health_scores = []

    healthy = 0
    inspection = 0
    critical = 0

    assets = db.query(Asset).all()

    for asset in assets:

        maintenance = (
            db.query(Maintenance)
            .filter(Maintenance.asset_id == asset.asset_id)
            .order_by(Maintenance.maintenance_id.desc())
            .first()
        )

        if maintenance:
            score = calculate_health_score(
                asset.status,
                maintenance.cost
            )
        else:
            score = calculate_health_score(
                asset.status,
                0
            )

        health_scores.append(score)

        if score >= 80:
            healthy += 1
        elif score >= 50:
            inspection += 1
        else:
            critical += 1

    if len(health_scores) > 0:
        average_health = round(
            sum(health_scores) / len(health_scores),
            2
        )
    else:
        average_health = 0

    # -------------------------
    # AI Statistics
    # -------------------------
    high = 0
    medium = 0
    low = 0

    probabilities = []

    for asset in assets:

        try:
            probability = predict_probability(asset)
        except Exception:
            probability = 0

        probabilities.append(probability)

        if probability >= 0.80:
            high += 1
        elif probability >= 0.50:
            medium += 1
        else:
            low += 1

    average_probability = (
        round(sum(probabilities) / len(probabilities), 2)
        if probabilities
        else 0
    )

    return {
        "total_assets": total_assets,
        "working_assets": working_assets,
        "under_maintenance": maintenance_assets,
        "out_of_service": out_of_service,
        "total_maintenance_cost": total_cost,

        "department_statistics": departments,

        "average_health_score": average_health,
        "healthy_assets": healthy,
        "needs_inspection": inspection,
        "critical_assets": critical,

        "ai_statistics": {
            "high_risk_assets": high,
            "medium_risk_assets": medium,
            "low_risk_assets": low,
            "average_failure_probability": average_probability
        }
    }