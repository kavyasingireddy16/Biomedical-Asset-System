from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.maintenance import Maintenance
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse
)

router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"]
)


# Create Maintenance Record
@router.post("/", response_model=MaintenanceResponse)
def create_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    new_record = Maintenance(
        asset_id=maintenance.asset_id,
        maintenance_date=maintenance.maintenance_date,
        maintenance_type=maintenance.maintenance_type,
        engineer_name=maintenance.engineer_name,
        cost=maintenance.cost,
        status=maintenance.status,
        remarks=maintenance.remarks
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


# View All Maintenance Records
@router.get("/", response_model=List[MaintenanceResponse])
def get_all_maintenance(db: Session = Depends(get_db)):
    records = db.query(Maintenance).all()
    return records


# View Maintenance Record by ID
@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def get_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(Maintenance).filter(
        Maintenance.maintenance_id == maintenance_id
    ).first()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return record


# Update Maintenance Record
@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    updated_record: MaintenanceUpdate,
    db: Session = Depends(get_db)
):
    record = db.query(Maintenance).filter(
        Maintenance.maintenance_id == maintenance_id
    ).first()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    record.asset_id = updated_record.asset_id
    record.maintenance_date = updated_record.maintenance_date
    record.maintenance_type = updated_record.maintenance_type
    record.engineer_name = updated_record.engineer_name
    record.cost = updated_record.cost
    record.status = updated_record.status
    record.remarks = updated_record.remarks

    db.commit()
    db.refresh(record)

    return record
# Delete Maintenance Record
@router.delete("/{maintenance_id}")
def delete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(Maintenance).filter(
        Maintenance.maintenance_id == maintenance_id
    ).first()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Maintenance record deleted successfully"
    }