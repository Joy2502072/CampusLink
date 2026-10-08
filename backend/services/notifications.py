from sqlalchemy.orm import Session
from backend.models import Application, Drive, User
from backend.schemas.notifications import NotificationResponse

def generate_template(event_type: str, context: dict) -> str:
    templates = {
        "SHORTLISTED": "Congratulations {name}, you have been shortlisted for {role} at {company}. Your Fit Score was {score}/100.",
        "SLOT_ASSIGNED": "Hi {name}, your interview for {role} is scheduled. Please check your portal for venue details.",
        "DOC_DEADLINE": "URGENT: {name}, you have pending documents for your offer at {company}. Please submit within 24 hours.",
        "OFFER_STALE": "Alert for Recruiter: Offer for {name} ({role}) has been pending for over 5 days. Consider following up.",
        "DRIVE_CONFLICT": "Alert for Cell Admin: A conflict was detected in drive '{drive_title}'."
    }
    template = templates.get(event_type, "New update regarding {company}.")
    return template.format(**context)

def dispatch_event(db: Session, event_type: str, app_id: int = None, drive_id: int = None, custom_msg: str = None) -> NotificationResponse:
    delivered_count = 0
    
    # Context variables for the template
    context = {
        "name": "Student",
        "role": "Role",
        "company": "Company",
        "score": "N/A",
        "drive_title": "Drive"
    }

    if app_id:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise ValueError(f"Application with ID {app_id} not found")
        student = app.student
        drive = app.drive
        company = drive.company if drive and hasattr(drive, 'company') else None
        
        context["name"] = student.first_name if student else "Student"
        context["role"] = drive.role_type if drive else "Role"
        context["company"] = company.name if company else "TechCorp"
        context["score"] = app.fit_score or "N/A"
        
        delivered_count = 1
    elif drive_id:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise ValueError(f"Drive with ID {drive_id} not found")
        context["drive_title"] = drive.title
        
        # e.g., if we are notifying all shortlisted students
        apps = db.query(Application).filter(Application.drive_id == drive_id, Application.status == "shortlisted").all()
        delivered_count = len(apps)
    else:
        # Generic broadcast
        delivered_count = 1
            
    final_message = custom_msg if custom_msg else generate_template(event_type, context)
    
    # Simulate Email Dispatch (console logging for hackathon)
    print(f"[EVENT BUS] Dispatched '{event_type}' to {delivered_count} recipients.")
    print(f"[EVENT BUS] Message Content: {final_message}")
    
    return NotificationResponse(
        success=True,
        message=f"Event {event_type} dispatched successfully.",
        delivered_to=delivered_count
    )
