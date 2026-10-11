from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Drive
from backend.schemas.scheduling import DetectConflictsRequest, DetectConflictsResponse
from backend.services.scheduling import detect_drive_conflicts

router = APIRouter(prefix="/scheduling", tags=["Scheduling & Conflicts"])

@router.post("/conflicts", response_model=DetectConflictsResponse)
def check_conflicts(req: DetectConflictsRequest, db: Session = Depends(get_db)):
    drive = db.query(Drive).filter(Drive.id == req.drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail=f"Drive with id {req.drive_id} not found")

    conflicts = detect_drive_conflicts(
        db=db,
        drive_id=req.drive_id,
        target_date=req.target_date,
        venue_id=req.venue_id,
        panel_id=req.panel_id
    )
    
    return DetectConflictsResponse(
        has_conflicts=len(conflicts) > 0,
        conflicts=conflicts
    )
