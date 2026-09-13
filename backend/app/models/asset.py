from sqlalchemy import Column, Integer, String, Float
from app.database.database import Base


class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(Integer, primary_key=True, index=True)

    asset_name = Column(String(100))
    asset_type = Column(String(100))
    manufacturer = Column(String(100))
    department = Column(String(100))
    status = Column(String(50))

    # QR Code
    qr_code = Column(String(255), nullable=True)

    # AI Prediction Fields
    asset_age = Column(Integer, default=0)
    usage_hours = Column(Integer, default=0)
    maintenance_count = Column(Integer, default=0)
    maintenance_cost = Column(Float, default=0)
    breakdown_count = Column(Integer, default=0)
    last_service_days = Column(Integer, default=0)
    warranty = Column(String(20), default="Yes")