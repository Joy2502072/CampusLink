from sqlalchemy.orm import Session
from datetime import datetime
import re
from backend.models import Application, Student, Drive
from backend.schemas.offers import OfferRiskResponse, OfferRiskFactor

def extract_ctc(ctc_str: str) -> float:
    if not ctc_str: return 0.0
    match = re.search(r'(\d+\.?\d*)', ctc_str)
    return float(match.group(1)) if match else 0.0

def predict_offer_risk(db: Session, application_id: int) -> OfferRiskResponse:
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise ValueError("Application not found")
        
    student = app.student
    drive = app.drive
    
    # Feature 1: CTC vs Branch Median
    # Using mock branch medians for the prototype
    branch_medians = {
        "CSE": 7.5, "IT": 7.0, "ECE": 5.5, "EEE": 5.0, "Mech": 4.5, "Civil": 4.5
    }
    median_ctc = branch_medians.get(student.branch, 5.0)
    offer_ctc = extract_ctc(drive.ctc_range)
    
    ctc_ratio = offer_ctc / median_ctc if median_ctc > 0 else 1.0
    
    # Feature 2: Competing offers/shortlists
    other_apps = db.query(Application).filter(
        Application.student_id == student.id,
        Application.id != application_id,
        Application.status.in_(["shortlisted", "offered", "selected"])
    ).all()
    competing_count = len(other_apps)
    
    # Feature 3: Time elapsed since application (simulated urgency)
    now = datetime.now()
    applied_time = app.applied_at or now
    days_elapsed = (now - applied_time).days
    
    # Heuristic probability calculation (Simulating a Logistic Regression Model)
    # Base probability = 60%
    base_prob = 60.0
    
    # Adjust for CTC
    if ctc_ratio > 1.2: base_prob += 25.0
    elif ctc_ratio < 0.8: base_prob -= 30.0
    
    # Adjust for competition
    base_prob -= (competing_count * 15.0)
    
    # Adjust for time
    if days_elapsed > 14: base_prob -= 10.0
    
    prob = max(5.0, min(95.0, base_prob))
    
    # Determine Risk Level
    if prob >= 70:
        risk_level = "LOW"
        action = "Standard follow-up in 3 days."
    elif prob >= 40:
        risk_level = "MEDIUM"
        action = "Send a personalized email highlighting company culture."
    else:
        risk_level = "HIGH"
        action = "Immediate phone call from hiring manager required."
        
    # Generate Explainability Factors
    factors = []
    if ctc_ratio > 1.2:
        factors.append(OfferRiskFactor(factor="CTC Competitiveness", impact="Positive", description=f"Offer CTC ({offer_ctc} LPA) is well above the {student.branch} average ({median_ctc} LPA)."))
    elif ctc_ratio < 0.8:
        factors.append(OfferRiskFactor(factor="CTC Competitiveness", impact="Negative", description=f"Offer CTC ({offer_ctc} LPA) is below the {student.branch} average ({median_ctc} LPA)."))
        
    if competing_count > 0:
        factors.append(OfferRiskFactor(factor="Competing Offers", impact="Negative", description=f"Student has {competing_count} other active pipeline(s)."))
    else:
        factors.append(OfferRiskFactor(factor="Market Exclusivity", impact="Positive", description="Student currently has no other active shortlists on CampusLink."))
        
    if days_elapsed > 14:
        factors.append(OfferRiskFactor(factor="Time Elapsed", impact="Negative", description=f"Process has dragged for {days_elapsed} days. Engagement may be dropping."))
        
    return OfferRiskResponse(
        application_id=app.id,
        student_name=f"{student.first_name} {student.last_name}",
        acceptance_probability_percent=round(prob, 1),
        risk_level=risk_level,
        top_factors=factors,
        recommended_action=action
    )
