from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MatchExplanation(BaseModel):
    student_id: int
    student_name: str
    rank: int
    score: float
    band: str
    breakdown: List[Dict[str, Any]]
    matched_skills: List[str]
    missing_must_have: List[str]
    missing_nice: List[str]
    hidden_gem: bool
    reasons: List[str]
    counterfactuals: List[Dict[str, Any]]
    summary: str
    ai_generated: bool

class MatchResponse(BaseModel):
    drive_id: int
    results: List[MatchExplanation]
    total_eligible: int
    total_registered: int
