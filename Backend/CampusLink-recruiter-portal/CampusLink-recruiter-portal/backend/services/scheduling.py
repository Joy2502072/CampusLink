from sqlalchemy.orm import Session
from datetime import datetime
from backend.models import Drive, Application, Student
from backend.schemas.scheduling import SchedulingConflict, ConflictAlternative

def detect_drive_conflicts(db: Session, drive_id: int, target_date: datetime, venue_id: int = None, panel_id: int = None):
    conflicts = []
    
    # Load current drive and shortlisted students
    current_drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not current_drive:
        return []
        
    shortlisted_apps = db.query(Application).filter(
        Application.drive_id == drive_id,
        Application.status == "shortlisted"
    ).all()
    shortlisted_student_ids = [app.student_id for app in shortlisted_apps]
    
    # 1. EXAM_CLASH (Simulated)
    # In a real scenario, this queries the exam_calendar table
    exam_dates = ["2026-10-15", "2026-10-20"] 
    if target_date.strftime("%Y-%m-%d") in exam_dates:
        conflicts.append(SchedulingConflict(
            type="EXAM_CLASH",
            severity="HIGH",
            affected=["All shortlisted students"],
            alternatives=[
                ConflictAlternative(description=f"Move drive to {target_date.strftime('%Y-%m')}-16", action_type="move_date"),
                ConflictAlternative(description=f"Move drive to {target_date.strftime('%Y-%m')}-21", action_type="move_date")
            ],
            auto_fix_available=True
        ))
        
    # 2. PPO_CONFLICT
    # Check if any shortlisted student already has a PPO
    # (Simulated for hackathon demo purposes based on student IDs)
    ppo_students = []
    for app in shortlisted_apps:
        if app.student_id % 15 == 0:  # arbitrary logic to flag some students
            ppo_students.append(f"Student ROLL{1000 + app.student_id}")
            
    if ppo_students:
        conflicts.append(SchedulingConflict(
            type="PPO_CONFLICT",
            severity="MEDIUM",
            affected=ppo_students[:3], # show up to 3
            alternatives=[
                ConflictAlternative(description="Remove PPO students from shortlist", action_type="remove_candidates"),
                ConflictAlternative(description="Ignore and proceed", action_type="ignore")
            ],
            auto_fix_available=True
        ))
        
    # 3. STUDENT_CLASH
    # Check if other active drives on the same day target the same students
    other_drives_today = db.query(Drive).filter(
        Drive.id != drive_id,
        Drive.start_date != None # simplified
    ).all()
    
    # Simulate a clash if another drive is scheduled roughly the same time
    for other_drive in other_drives_today:
        if other_drive.start_date and other_drive.start_date.date() == target_date.date():
            # Check overlap in shortlists
            other_apps = db.query(Application).filter(Application.drive_id == other_drive.id).all()
            other_student_ids = [a.student_id for a in other_apps]
            
            clashing_ids = set(shortlisted_student_ids).intersection(set(other_student_ids))
            if clashing_ids:
                conflicts.append(SchedulingConflict(
                    type="STUDENT_CLASH",
                    severity="HIGH",
                    affected=[f"{len(clashing_ids)} students shortlisted for both {current_drive.title} and {other_drive.title}"],
                    alternatives=[
                        ConflictAlternative(description="Apply student preference policy (higher CTC wins)", action_type="resolve_policy"),
                        ConflictAlternative(description="Shift drive by 1 day", action_type="move_date")
                    ],
                    auto_fix_available=True
                ))

    return conflicts
