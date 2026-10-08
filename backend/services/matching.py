from sqlalchemy.orm import Session
from backend.models import Student, DriveRequirement, Application, Assessment
from backend.schemas.matching import MatchExplanation
import numpy as np

def calculate_band(score: float) -> str:
    if score >= 80: return "Highly Employable"
    if score >= 65: return "Ready"
    if score >= 40: return "Developing"
    return "Not Ready"

def evaluate_student(student: Student, req: DriveRequirement, db: Session) -> dict:
    cgpa = student.cgpa if student.cgpa is not None else 0.0
    backlogs = student.backlogs if student.backlogs is not None else 0

    # 1. Hard Filters (Eligibility)
    if req.min_cgpa and cgpa < req.min_cgpa:
        return {"eligible": False, "reason": f"CGPA {cgpa} below cutoff {req.min_cgpa}"}
    if req.max_backlogs is not None and backlogs > req.max_backlogs:
        return {"eligible": False, "reason": f"Backlogs {backlogs} above allowed {req.max_backlogs}"}
    if req.branches_json and student.branch not in req.branches_json:
        return {"eligible": False, "reason": f"Branch {student.branch} not eligible"}
    if req.batch_year and student.graduation_year != req.batch_year:
        return {"eligible": False, "reason": "Batch year mismatch"}

    # 2. Score Calculation
    total_score = 0.0
    breakdown = []
    reasons = [f"CGPA {cgpa} meets the {req.min_cgpa or '0'} cutoff ✓"]
    
    # Skills (35 points)
    must_have = req.must_have_skills_json or []
    nice_to_have = req.nice_to_have_skills_json or []
    
    student_skill_names = [s.skill.name.lower() for s in (student.skills or []) if s.skill and s.skill.name]
    matched_skills = []
    missing_must_have = []
    missing_nice = []
    
    for mh in must_have:
        if mh.lower() in student_skill_names:
            matched_skills.append(mh)
        else:
            missing_must_have.append(mh)
            
    for nh in nice_to_have:
        if nh.lower() in student_skill_names:
            matched_skills.append(nh)
        else:
            missing_nice.append(nh)
            
    mh_score = (len([s for s in must_have if s in matched_skills]) / len(must_have)) if must_have else 1.0
    nh_score = (len([s for s in nice_to_have if s in matched_skills]) / len(nice_to_have)) if nice_to_have else 1.0
    
    skills_points = (0.7 * mh_score + 0.3 * nh_score) * 35
    total_score += skills_points
    breakdown.append({"factor": "skills", "weight": 35, "earned": round(skills_points, 1), "detail": f"{len(must_have)-len(missing_must_have)}/{len(must_have)} must-have"})

    if missing_must_have:
        reasons.append(f"Missing must-have skills: {', '.join(missing_must_have)} ✗")

    # Assessments (15 points)
    aptitude = next((a for a in student.assessments if a.type == "aptitude"), None)
    apt_score = (aptitude.score / 100) * 15 if aptitude else 7.5
    total_score += apt_score
    breakdown.append({"factor": "assessments", "weight": 15, "earned": round(apt_score, 1), "detail": f"Aptitude score {aptitude.score if aptitude else 'N/A'}"})
    
    # Mock Interview (15 points)
    mock = next((a for a in student.assessments if a.type == "mock_interview"), None)
    mock_pts = (mock.score / 100) * 15 if mock else 7.5
    total_score += mock_pts
    breakdown.append({"factor": "mock_interview", "weight": 15, "earned": round(mock_pts, 1), "detail": f"Mock score {mock.score if mock else 'N/A'}"})
    
    if mock and mock.score < 70:
        reasons.append(f"Mock interview score ({mock.score}) is below the 70 benchmark ✗")

    # CGPA (10 points)
    cgpa_pts = min(10.0, (cgpa / 10.0) * 10)
    total_score += cgpa_pts
    breakdown.append({"factor": "cgpa", "weight": 10, "earned": round(cgpa_pts, 1), "detail": f"{cgpa} CGPA"})
    
    # Projects (15 points)
    student_projects = student.projects or []
    proj_pts = 10.0 if student_projects else 0.0 # simplified logic
    total_score += proj_pts
    breakdown.append({"factor": "projects", "weight": 15, "earned": round(proj_pts, 1), "detail": f"{len(student_projects)} projects"})

    # Certifications & Past Perf (10 points static for prototype)
    total_score += 10.0
    breakdown.append({"factor": "other", "weight": 10, "earned": 10.0, "detail": "Certifications and Past Performance"})

    # Determine band and hidden gem
    score = round(total_score, 1)
    band = calculate_band(score)
    hidden_gem = score >= 70 and cgpa < 7.0

    # Counterfactuals
    counterfactuals = []
    if missing_must_have:
        cf_score = min(100, score + (0.7 / (len(must_have) or 1)) * 35)
        counterfactuals.append({
            "action": f"Add {missing_must_have[0]} skill (verified)",
            "new_score": round(cf_score, 1),
            "new_band": calculate_band(cf_score),
            "delta": f"+{round(cf_score - score, 1)}"
        })

    summary = f"{student.first_name} meets eligibility criteria with a {student.cgpa} CGPA. "
    if missing_must_have:
        summary += f"The primary gap is {missing_must_have[0]} (a must-have skill). "
    else:
        summary += "Strong skill alignment with the job requirements. "

    return {
        "eligible": True,
        "result": {
            "student_id": student.id,
            "student_name": f"{student.first_name} {student.last_name}",
            "score": score,
            "band": band,
            "breakdown": breakdown,
            "matched_skills": matched_skills,
            "missing_must_have": missing_must_have,
            "missing_nice": missing_nice,
            "hidden_gem": hidden_gem,
            "reasons": reasons,
            "counterfactuals": counterfactuals,
            "summary": summary,
            "ai_generated": False # true if we used LLM to generate summary
        }
    }

def match_students_for_drive(drive_id: int, db: Session) -> dict:
    from backend.models import Drive
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive or not drive.requirements:
        return {"error": "Drive or requirements not found"}
        
    req = drive.requirements
    students = db.query(Student).all()
    
    total_registered = len(students)
    eligible_results = []
    
    for student in students:
        eval_data = evaluate_student(student, req, db)
        if eval_data["eligible"]:
            eligible_results.append(eval_data["result"])
            
    # Rank them
    eligible_results.sort(key=lambda x: x["score"], reverse=True)
    
    # Assign ranks
    for i, res in enumerate(eligible_results):
        res["rank"] = i + 1
        
    return {
        "drive_id": drive_id,
        "total_registered": total_registered,
        "total_eligible": len(eligible_results),
        "results": eligible_results
    }
