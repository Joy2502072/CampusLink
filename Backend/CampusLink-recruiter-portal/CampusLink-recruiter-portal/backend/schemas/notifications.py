from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class NotificationEventRequest(BaseModel):
    event_type: str # SHORTLISTED, SLOT_ASSIGNED, DOC_DEADLINE, OFFER_STALE
    application_id: Optional[int] = None
    drive_id: Optional[int] = None
    custom_message: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    message: str
    delivered_to: int
