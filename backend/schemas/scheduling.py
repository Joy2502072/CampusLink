from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ConflictAlternative(BaseModel):
    description: str
    action_type: str # e.g., move_date, change_venue, change_panel

class SchedulingConflict(BaseModel):
    type: str # VENUE_DOUBLE_BOOKING, STUDENT_CLASH, PANEL_UNAVAILABLE, EXAM_CLASH, PPO_CONFLICT
    severity: str # HIGH, MEDIUM, LOW
    affected: List[str]
    alternatives: List[ConflictAlternative]
    auto_fix_available: bool

class DetectConflictsRequest(BaseModel):
    drive_id: int
    target_date: datetime
    venue_id: Optional[int] = None
    panel_id: Optional[int] = None

class DetectConflictsResponse(BaseModel):
    has_conflicts: bool
    conflicts: List[SchedulingConflict]
