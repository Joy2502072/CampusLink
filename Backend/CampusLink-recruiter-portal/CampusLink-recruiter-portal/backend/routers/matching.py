from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.matching import MatchResponse
from backend.services.matching import match_students_for_drive

router = APIRouter(prefix="/drives", tags=["Matching & Drives"])

@router.get("/{drive_id}/match", response_model=MatchResponse)
def get_drive_matches(drive_id: int, db: Session = Depends(get_db)):
    result = match_students_for_drive(drive_id, db)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
