from datetime import date
from pydantic import BaseModel


class MaintenanceBase(BaseModel):
    asset_id: int
    maintenance_date: date
    maintenance_type: str
    engineer_name: str
    cost: float
    status: str
    remarks: str


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(MaintenanceBase):
    pass


class MaintenanceResponse(MaintenanceBase):
    maintenance_id: int

    class Config:
        from_attributes = True