from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # student, recruiter, interviewer, cell_admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    roll_number = Column(String, unique=True, index=True)
    branch = Column(String) # CSE, IT, ECE, EEE, Mech, Civil
    cgpa = Column(Float)
    backlogs = Column(Integer, default=0)
    graduation_year = Column(Integer)
    phone = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)

    skills = relationship("StudentSkill", back_populates="student")
    projects = relationship("Project", back_populates="student")
    assessments = relationship("Assessment", back_populates="student")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    aliases_json = Column(JSON, default=list) # ["PostgreSQL", "Postgres", "psql"]

class StudentSkill(Base):
    __tablename__ = "student_skills"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    proficiency = Column(Integer) # 1-5
    verified = Column(Boolean, default=False)

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String)
    description = Column(Text)
    repo_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    tech_stack_json = Column(JSON, default=list)

    student = relationship("Student", back_populates="projects")

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    type = Column(String) # aptitude, domain, mock_interview, communication
    score = Column(Float)
    max_score = Column(Float)
    date_taken = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    student = relationship("Student", back_populates="assessments")

class Drive(Base):
    __tablename__ = "drives"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String)
    description = Column(Text, nullable=True)
    role_type = Column(String)
    ctc_range = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="draft") # draft, published, active, completed
    
    requirements = relationship("DriveRequirement", back_populates="drive", uselist=False)
    company = relationship("Company")

class DriveRequirement(Base):
    __tablename__ = "drive_requirements"
    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"))
    min_cgpa = Column(Float, nullable=True)
    max_backlogs = Column(Integer, nullable=True)
    branches_json = Column(JSON, default=list)
    batch_year = Column(Integer, nullable=True)
    must_have_skills_json = Column(JSON, default=list) # skill names
    nice_to_have_skills_json = Column(JSON, default=list)

    drive = relationship("Drive", back_populates="requirements")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    drive_id = Column(Integer, ForeignKey("drives.id"))
    status = Column(String, default="applied") # applied, shortlisted, aptitude, technical, hr, selected, offered, accepted, joined, rejected, held
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    fit_score = Column(Float, nullable=True)
    band = Column(String, nullable=True)
    explanation_json = Column(JSON, nullable=True)

    student = relationship("Student")
    drive = relationship("Drive")
