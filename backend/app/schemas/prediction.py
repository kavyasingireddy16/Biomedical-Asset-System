from pydantic import BaseModel


class PredictionRequest(BaseModel):
    asset_type: str
    manufacturer: str
    department: str
    asset_age: int
    usage_hours: int
    maintenance_count: int
    maintenance_cost: float
    breakdown_count: int
    last_service_days: int
    status: str
    warranty: str