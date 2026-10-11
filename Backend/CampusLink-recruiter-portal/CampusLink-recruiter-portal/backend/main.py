from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine
from backend.models import Base

app = FastAPI(title="CampusLink Recruiter Portal API", version="1.0.0")

# Create tables on startup
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.routers import jd, matching, scheduling, offers, notifications
app.include_router(jd.router)
app.include_router(matching.router)
app.include_router(scheduling.router)
app.include_router(offers.router)
app.include_router(notifications.router)

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API connected"}
