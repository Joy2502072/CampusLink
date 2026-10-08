from pydantic import BaseModel
from typing import List, Optional

class JDParseRequest(BaseModel):
    text: str

class JDParseResponse(BaseModel):
    role: str
    must_have: List[str]
    nice_to_have: List[str]
    min_cgpa: Optional[float]
    max_backlogs: Optional[int]
    branches: List[str]
    batch: Optional[int]
    ctc_range: Optional[str]
    location: Optional[str]
