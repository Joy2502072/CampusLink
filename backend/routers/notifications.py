from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.notifications import NotificationEventRequest, NotificationResponse
from backend.services.notifications import dispatch_event
from backend.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/notifications", tags=["Notifications & Events"])

@router.post("/dispatch", response_model=NotificationResponse)
def dispatch_notification(req: NotificationEventRequest, db: Session = Depends(get_db)):
    try:
        return dispatch_event(db, req.event_type, req.application_id, req.drive_id, req.custom_message)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
