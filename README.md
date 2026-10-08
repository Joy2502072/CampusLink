# CampusLink — Recruiter Portal Backend

AI-driven recruitment and placement intelligence engine for BPUT. Automates resume filtering, candidate matching with explainability, conflict-aware scheduling, and offer risk analysis.

---

## ⚡ Features

- **JD Parser (`/jd/parse`)**: Extracts skills, CGPA cutoff, backlogs, branch eligibility, and CTC from raw job descriptions.
- **100-Point Matching Engine (`/drives/{id}/match`)**: Ranks students using an explainable 5-pillar scoring model (Skills, Academics, Assessments, Projects).
- **Hidden Gem Detection**: Spots high-potential candidates with strong coding skills and moderate CGPA.
- **Conflict-Aware Scheduler (`/scheduling/conflicts`)**: Detects university exam clashes, panel overlaps, and candidate interview conflicts.
- **Offer Risk Predictor (`/offers/{id}/risk`)**: Predicts offer acceptance probability (0–100%) and recommends recruiter retention actions.
- **Notification Event Bus (`/notifications/dispatch`)**: Dispatches automated alerts for status updates (`SHORTLISTED`, `SLOT_ASSIGNED`, etc.).

---

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite (via SQLAlchemy ORM, PostgreSQL-ready)
- **AI / Heuristics**: Google Gemini API + offline heuristic fallback engine
- **Data Model**: Pre-seeded with 800 student profiles, assessment scores, and drives

---

## 🚀 Quick Setup & Run

1. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Seed database** (creates 800 students & sample applications):
   ```bash
   python -m backend.seed.run
   ```

4. **Run development server**:
   ```bash
   uvicorn backend.main:app --reload
   ```

5. **Access Interactive API Docs (Swagger UI)**:
   Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/jd/parse` | Parse job description text into structured criteria |
| `GET` | `/drives/{drive_id}/match` | Rank eligible students with 100-pt explainable scoring |
| `POST` | `/scheduling/conflicts` | Check date/venue/panel conflicts before scheduling |
| `GET` | `/offers/{app_id}/risk` | Predict offer dropout/acceptance probability & actions |
| `POST` | `/notifications/dispatch` | Send automated pipeline event notifications |

---

## 🔒 Security & Privacy

- **No Plaintext Passwords**: Uses cryptographic password hashing.
- **Zero Exposed Keys**: External API keys are kept in `.env` and never committed.
- **Local Fallback**: Local heuristic models ensure candidate data never leaks if external AI is disabled.
- **Clean `.gitignore`**: Sensitive files (`.env`, `*.db`, `venv/`, and `tests/`) are excluded from version control.
