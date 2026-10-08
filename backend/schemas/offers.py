from pydantic import BaseModel
from typing import List, Optional

class OfferRiskFactor(BaseModel):
    factor: str
    impact: str # "Positive" or "Negative"
    description: str

class OfferRiskResponse(BaseModel):
    application_id: int
    student_name: str
    acceptance_probability_percent: float
    risk_level: str # "LOW", "MEDIUM", "HIGH"
    top_factors: List[OfferRiskFactor]
    recommended_action: str
