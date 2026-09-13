from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.asset import Asset
from app.models.maintenance import Maintenance
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.services.health_score import calculate_health_score
from app.services.qr_service import generate_qr

router = APIRouter(
    prefix="/assets",
    tags=["Biomedical Assets"]
)


# -------------------------------------------------------
# Create Asset
# -------------------------------------------------------
@router.post("/", response_model=AssetResponse)
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db)
):

    new_asset = Asset(
        asset_name=asset.asset_name,
        asset_type=asset.asset_type,
        manufacturer=asset.manufacturer,
        department=asset.department,
        status=asset.status,

        # AI Fields
        asset_age=asset.asset_age,
        usage_hours=asset.usage_hours,
        maintenance_count=asset.maintenance_count,
        maintenance_cost=asset.maintenance_cost,
        breakdown_count=asset.breakdown_count,
        last_service_days=asset.last_service_days,
        warranty=asset.warranty
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    # Generate QR Code
    qr_path = generate_qr(new_asset.asset_id)

    # Save QR Path
    new_asset.qr_code = qr_path

    db.commit()
    db.refresh(new_asset)

    return new_asset


# -------------------------------------------------------
# View All Assets
# -------------------------------------------------------
@router.get("/", response_model=List[AssetResponse])
def get_all_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()


# -------------------------------------------------------
# View Asset By ID
# -------------------------------------------------------
@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):

    asset = db.query(Asset).filter(
        Asset.asset_id == asset_id
    ).first()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset


# -------------------------------------------------------
# Update Asset
# -------------------------------------------------------
@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    updated_asset: AssetUpdate,
    db: Session = Depends(get_db)
):

    asset = db.query(Asset).filter(
        Asset.asset_id == asset_id
    ).first()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    asset.asset_name = updated_asset.asset_name
    asset.asset_type = updated_asset.asset_type
    asset.manufacturer = updated_asset.manufacturer
    asset.department = updated_asset.department
    asset.status = updated_asset.status

    # AI Fields
    asset.asset_age = updated_asset.asset_age
    asset.usage_hours = updated_asset.usage_hours
    asset.maintenance_count = updated_asset.maintenance_count
    asset.maintenance_cost = updated_asset.maintenance_cost
    asset.breakdown_count = updated_asset.breakdown_count
    asset.last_service_days = updated_asset.last_service_days
    asset.warranty = updated_asset.warranty

    db.commit()
    db.refresh(asset)

    return asset


# -------------------------------------------------------
# Delete Asset
# -------------------------------------------------------
@router.delete("/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):

    asset = db.query(Asset).filter(
        Asset.asset_id == asset_id
    ).first()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    db.delete(asset)
    db.commit()

    return {
        "message": "Asset deleted successfully"
    }


# -------------------------------------------------------
# Health Score
# -------------------------------------------------------
@router.get("/health-score/{asset_id}")
def get_health_score(
    asset_id: int,
    db: Session = Depends(get_db)
):

    asset = db.query(Asset).filter(
        Asset.asset_id == asset_id
    ).first()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.asset_id == asset_id)
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

    if score >= 80:
        condition = "Healthy"
    elif score >= 50:
        condition = "Needs Inspection"
    else:
        condition = "Critical"

    return {
        "asset_id": asset.asset_id,
        "asset_name": asset.asset_name,
        "health_score": score,
        "condition": condition
    }


# -------------------------------------------------------
# Get QR Code
# -------------------------------------------------------
@router.get("/{asset_id}/qr")
def get_qr_code(
    asset_id: int,
    db: Session = Depends(get_db)
):

    asset = db.query(Asset).filter(
        Asset.asset_id == asset_id
    ).first()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    if not asset.qr_code:
        raise HTTPException(
            status_code=404,
            detail="QR Code not found"
        )

    return FileResponse(
        path=asset.qr_code,
        media_type="image/png"
    )