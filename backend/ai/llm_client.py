import os
import json
import google.generativeai as genai

# Setup Gemini SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def parse_jd_with_llm(text: str):
    """
    Uses an LLM to extract skills and role from a JD.
    Includes a deterministic fallback if the API key is missing or the call fails,
    satisfying the hackathon rule for offline resilience.
    """
    fallback_data = {
        "role": "Software Engineer",
        "must_have": ["Python", "SQL", "React"],
        "nice_to_have": ["AWS", "Docker"]
    }
    
    if not api_key:
        print("No GEMINI_API_KEY found, using JD parser fallback.")
        return fallback_data
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Extract the following information from the job description text below and return it as JSON with the following keys:
        - "role": The title of the role (e.g. "Full-Stack Developer").
        - "must_have": A list of must-have technical skills.
        - "nice_to_have": A list of nice-to-have or preferred technical skills.
        
        Job Description:
        {text}
        
        Return ONLY valid JSON. Do not include markdown formatting.
        """
        response = model.generate_content(prompt)
        
        cleaned = response.text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:-3]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:-3]
            
        return json.loads(cleaned)
    except Exception as e:
        print(f"LLM parsing failed ({e}), using fallback.")
        return fallback_data
