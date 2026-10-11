from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.offers import OfferRiskResponse
from backend.services.offer_risk import predict_offer_risk

router = APIRouter(prefix="/offers", tags=["Offers & Risk"])

@router.get("/{application_id}/risk", response_model=OfferRiskResponse)
def get_offer_risk(application_id: int, db: Session = Depends(get_db)):
    try:
        return predict_offer_risk(db, application_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
