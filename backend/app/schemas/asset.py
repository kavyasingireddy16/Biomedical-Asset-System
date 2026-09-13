from pydantic import BaseModel


class AssetBase(BaseModel):
    asset_name: str
    asset_type: str
    manufacturer: str
    department: str
    status: str

    # AI Fields
    asset_age: int
    usage_hours: int
    maintenance_count: int
    maintenance_cost: float
    breakdown_count: int
    last_service_days: int
    warranty: str


class AssetCreate(AssetBase):
    pass


class AssetUpdate(AssetBase):
    pass


class AssetResponse(AssetBase):
    asset_id: int
    qr_code: str | None = None

    class Config:
        from_attributes = True