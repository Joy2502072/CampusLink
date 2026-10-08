from fastapi import APIRouter
from backend.schemas.jd import JDParseRequest, JDParseResponse
from backend.services.jd_parser import parse_jd_text

router = APIRouter(prefix="/jd", tags=["Job Descriptions"])

@router.post("/parse", response_model=JDParseResponse)
def parse_jd(req: JDParseRequest):
    result = parse_jd_text(req.text)
    return result
