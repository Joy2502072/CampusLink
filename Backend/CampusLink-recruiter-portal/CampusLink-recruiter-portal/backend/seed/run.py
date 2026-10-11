from backend.database import engine, SessionLocal
from backend.models import Base, User, Company, Student, Skill, StudentSkill, Project, Assessment, Drive, DriveRequirement, Application
import random
import json
import os
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_data():
    print("Seeding database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Random seed for determinism
    random.seed(42)
    
    # 1. Add skills
    skills_data = [
        {"name": "Python", "category": "Language", "aliases": ["Python 3", "py"]},
        {"name": "React", "category": "Frontend", "aliases": ["ReactJS", "React.js"]},
        {"name": "Node.js", "category": "Backend", "aliases": ["Node", "NodeJS"]},
        {"name": "PostgreSQL", "category": "Database", "aliases": ["Postgres", "psql"]},
        {"name": "Docker", "category": "DevOps", "aliases": []},
        {"name": "AWS", "category": "Cloud", "aliases": ["Amazon Web Services"]},
        {"name": "SQL", "category": "Database", "aliases": ["MySQL", "SQL Server"]},
        {"name": "MongoDB", "category": "Database", "aliases": ["Mongo"]},
        {"name": "TypeScript", "category": "Language", "aliases": ["TS"]},
        {"name": "C++", "category": "Language", "aliases": ["cpp"]},
        {"name": "Java", "category": "Language", "aliases": ["Java 8", "Java 11"]}
    ]
    
    skills = []
    for s in skills_data:
        skill = Skill(name=s["name"], category=s["category"], aliases_json=s["aliases"])
        db.add(skill)
        skills.append(skill)
    
    db.commit()
    
    # 2. Add Users (Recruiter)
    recruiter_user = User(
        email="recruiter@techcorp.com",
        password_hash=hash_password("password"),
        role="recruiter"
    )
    db.add(recruiter_user)
    db.commit()
    
    company = Company(
        name="TechCorp",
        description="Leading product company.",
        industry="Technology"
    )
    db.add(company)
    db.commit()
    
    # 3. Add Drives
    drive1 = Drive(
        company_id=company.id,
        title="Full-Stack Developer",
        role_type="Full-Stack",
        ctc_range="10-15 LPA",
        status="active"
    )
    db.add(drive1)
    db.commit()
    
    req1 = DriveRequirement(
        drive_id=drive1.id,
        min_cgpa=7.0,
        max_backlogs=0,
        branches_json=["CSE", "IT"],
        must_have_skills_json=["React", "Node.js", "SQL", "Docker"],
        nice_to_have_skills_json=["AWS"]
    )
    db.add(req1)
    db.commit()
    
    # 4. Generate 800 Students
    branches = ["CSE", "IT", "ECE", "EEE", "Mech", "Civil"]
    for i in range(1, 801):
        # 15% hidden gems: CGPA 6-7, strong skills
        # 20% stars: CGPA 8.5+, strong skills
        # 65% average
        rand_val = random.random()
        
        if rand_val < 0.15:
            # Hidden Gem
            cgpa = round(random.uniform(6.0, 6.9), 2)
            num_skills = random.randint(5, 8)
            aptitude = random.randint(70, 95)
            mock = random.randint(70, 95)
        elif rand_val < 0.35:
            # Star
            cgpa = round(random.uniform(8.5, 9.8), 2)
            num_skills = random.randint(6, 10)
            aptitude = random.randint(80, 100)
            mock = random.randint(80, 100)
        else:
            # Average
            cgpa = round(random.uniform(5.5, 8.4), 2)
            num_skills = random.randint(2, 5)
            aptitude = random.randint(40, 75)
            mock = random.randint(40, 75)
            
        student_user = User(
            email=f"student{i}@bput.ac.in",
            password_hash=hash_password("password"),
            role="student"
        )
        db.add(student_user)
        db.flush()
        
        student = Student(
            user_id=student_user.id,
            first_name=f"First{i}",
            last_name=f"Last{i}",
            roll_number=f"ROLL{1000+i}",
            branch=random.choice(branches),
            cgpa=cgpa,
            graduation_year=2027,
            backlogs=random.choice([0, 0, 0, 0, 1, 2])
        )
        db.add(student)
        db.flush()
        
        # Add skills
        student_skills = random.sample(skills, min(num_skills, len(skills)))
        for s in student_skills:
            ss = StudentSkill(
                student_id=student.id,
                skill_id=s.id,
                proficiency=random.randint(2, 5),
                verified=random.choice([True, False])
            )
            db.add(ss)
            
        # Add Assessments
        db.add(Assessment(student_id=student.id, type="aptitude", score=aptitude, max_score=100))
        db.add(Assessment(student_id=student.id, type="mock_interview", score=mock, max_score=100))
        
        # Optionally add a project
        if random.random() > 0.5:
            db.add(Project(
                student_id=student.id,
                title=f"Project {i}",
                description="A cool project.",
                tech_stack_json=[s.name for s in random.sample(skills, 2)]
            ))
            
    # 5. Add sample applications for drive1
    statuses = ["shortlisted", "offered", "applied", "technical", "selected"]
    for sid in range(1, 51):
        status = statuses[sid % len(statuses)]
        app = Application(
            student_id=sid,
            drive_id=drive1.id,
            status=status,
            fit_score=round(random.uniform(65.0, 96.0), 1),
            band="Strong Match" if sid % 2 == 0 else "Good Match"
        )
        db.add(app)
        
    db.commit()
    db.close()
    print("Database seeded with 800 students and 50 applications!")

if __name__ == "__main__":
    seed_data()
