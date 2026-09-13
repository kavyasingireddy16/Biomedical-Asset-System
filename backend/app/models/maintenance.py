from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Maintenance(Base):
    __tablename__ = "maintenance"

    maintenance_id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.asset_id"))

    maintenance_date = Column(Date)
    maintenance_type = Column(String(100))
    engineer_name = Column(String(100))
    cost = Column(Float)
    status = Column(String(50))
    remarks = Column(String(255))

    asset = relationship("Asset")