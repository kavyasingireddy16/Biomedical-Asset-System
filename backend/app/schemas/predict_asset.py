from pydantic import BaseModel


class AssetPredictionRequest(BaseModel):
    asset_id: int