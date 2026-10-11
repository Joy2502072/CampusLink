# CampusLink Shared Schema

This is the single source of truth for database schemas shared between the Student Portal and Recruiter Portal teams.
Please ensure all models follow these naming conventions and fields.

## Users & Core
- `users`: id, email, password_hash, role (student, recruiter, interviewer, cell_admin), created_at, updated_at
- `companies`: id, name, logo_url, description, industry, website

## Students & Profiles
- `students`: id, user_id, first_name, last_name, roll_number, branch (CSE, IT, ECE, EEE, Mech, Civil), cgpa, backlogs, graduation_year, phone, resume_url
- `skills`: id, name, category, aliases_json (e.g., `["PostgreSQL", "Postgres", "psql"]`)
- `student_skills`: id, student_id, skill_id, proficiency (1-5), verified (boolean)
- `projects`: id, student_id, title, description, repo_url, live_url, tech_stack_json
- `certifications`: id, student_id, name, issuer, issue_date, url
- `assessments`: id, student_id, type (aptitude, domain, mock_interview, communication), score, max_score, date_taken, notes

## Drives & Requirements
- `drives`: id, company_id, title, description, role_type, ctc_range, location, start_date, end_date, status (draft, published, active, completed)
- `drive_requirements`: id, drive_id, min_cgpa, max_backlogs, branches_json, batch_year, must_have_skills_json, nice_to_have_skills_json

## Applications & Pipeline
- `applications`: id, student_id, drive_id, status (applied, shortlisted, aptitude, technical, hr, selected, offered, accepted, joined, rejected, held), applied_at
- `application_scores`: id, application_id, fit_score, band, explanation_json (the XAI object)
- `round_scores`: id, application_id, round_type, score, max_score, interviewer_id, feedback_notes
- `interview_slots`: id, drive_id, application_id, venue_id, panel_id, start_time, end_time, status

## Offers & Logistics
- `venues`: id, name, capacity, location
- `panels`: id, drive_id, interviewer_id
- `offers`: id, application_id, ctc_breakdown_json, role, offer_type (full-time, ppo, internship), joining_date, bond_terms, response_deadline, status, offer_letter_hash
- `offer_documents`: id, offer_id, doc_type, url, status (pending, submitted, verified, rejected)

## System
- `notifications`: id, user_id, title, body, type, is_read, created_at
- `notification_templates`: id, name, subject_template, body_template
- `audit_log`: id, user_id, entity_type, entity_id, action, before_json, after_json, timestamp
- `historical_placements`: id, student_branch, student_cgpa, company_name, role_type, ctc, joined_date (for cohort intelligence)
- `exam_calendar`: id, date, branch, description (for conflict detection)
