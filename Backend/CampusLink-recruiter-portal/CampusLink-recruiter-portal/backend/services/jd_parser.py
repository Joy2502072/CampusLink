import re
from backend.ai.llm_client import parse_jd_with_llm

def parse_jd_text(text: str) -> dict:
    if not text or not isinstance(text, str) or not text.strip():
        return {
            "role": "Software Engineer",
            "must_have": [],
            "nice_to_have": [],
            "min_cgpa": None,
            "max_backlogs": None,
            "branches": ["CSE", "IT"],
            "batch": None,
            "ctc_range": None,
            "location": None
        }

    # 1. Semantic extraction via LLM
    llm_data = parse_jd_with_llm(text)
    
    # 2. Heuristic extraction for strict numeric/enum fields
    # CGPA fallback: matches "min 7.5 CGPA", "CGPA: 7.5", "7.0+ CGPA", etc.
    min_cgpa = None
    cgpa_match = re.search(r'(?:min(?:imum)?\s*)?(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:CGPA|GPA)|(?:CGPA|GPA)\s*(?:of|min(?:imum)?|>=|:|\s)\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
    if cgpa_match:
        val_str = cgpa_match.group(1) or cgpa_match.group(2)
        if val_str:
            val = float(val_str)
            min_cgpa = val / 10 if val > 10 else val
        
    # Backlogs fallback: matches "0 backlogs", "max 1 backlog", "backlogs: 0", "no backlogs"
    max_backlogs = None
    if re.search(r'\bno\s+backlogs?\b', text, re.IGNORECASE):
        max_backlogs = 0
    else:
        backlog_match = re.search(r'(\d+)\s*backlogs?|(?:backlogs?|arrears?)\s*(?:max(?:imum)?|<=|<|:|\s)\s*(\d+)', text, re.IGNORECASE)
        if backlog_match:
            b_val = backlog_match.group(1) or backlog_match.group(2)
            if b_val:
                max_backlogs = int(b_val)
            
    # Branches extraction
    branches = []
    text_upper = text.upper()
    if "CSE" in text_upper or "COMPUTER SCIENCE" in text_upper:
        branches.append("CSE")
    if "IT" in text_upper or "INFORMATION TECH" in text_upper:
        branches.append("IT")
    if "ECE" in text_upper or "ELECTRONICS" in text_upper:
        branches.append("ECE")
    if "MECH" in text_upper or "MECHANICAL" in text_upper:
        branches.append("Mech")
    if "CIVIL" in text_upper:
        branches.append("Civil")
        
    # CTC Range fallback
    ctc_range = None
    ctc_match = re.search(r'(\d+(?:\.\d+)?\s*(?:-\s*\d+(?:\.\d+)?)?\s*LPA|\d+\s*-\s*\d+\s*Lakhs?)', text, re.IGNORECASE)
    if ctc_match:
        ctc_range = ctc_match.group(1)
    
    return {
        "role": llm_data.get("role", "Software Engineer"),
        "must_have": llm_data.get("must_have", []),
        "nice_to_have": llm_data.get("nice_to_have", []),
        "min_cgpa": min_cgpa,
        "max_backlogs": max_backlogs,
        "branches": branches if branches else ["CSE", "IT"],
        "batch": 2027 if "2027" in text else None,
        "ctc_range": ctc_range,
        "location": None
    }
