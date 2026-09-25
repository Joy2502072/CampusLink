/**
 * CampusLink Backend - In-Memory Synthetic Notification Dataset
 * 
 * NOTICE:
 * All records herein are purely synthetic and generated for prototype demonstration.
 * Identifiers (NOT-XXX, DRV-XXX), company names, and messages are fictitious.
 * No real email, SMS, push notifications, or personal data are processed.
 */

export const notifications = [
  {
    id: "NOT-001",
    title: "Round 2 Technical Interview Schedule Released",
    message: "Shortlisted candidates for Associate Software Engineer must report to Auditorium 1 at 09:30 AM with two hard copies of updated resumes and college photo IDs.",
    type: "Drive Schedule",
    priority: "Urgent",
    audience: "Specific Drive",
    branch: "All",
    driveId: "DRV-201",
    status: "Sent",
    createdAt: "2026-09-24 09:15",
    scheduledFor: null,
    recipientsCount: 24
  },
  {
    id: "NOT-002",
    title: "Mandatory Profile & Marksheet Verification Deadline",
    message: "All 2026 graduating batch scholars must upload attested 6th-semester SGPA transcripts and verify back-paper clearances on the portal by Sep 27, 5:00 PM.",
    type: "Document Deadline",
    priority: "Important",
    audience: "All Students",
    branch: "All",
    driveId: null,
    status: "Sent",
    createdAt: "2026-09-23 14:00",
    scheduledFor: null,
    recipientsCount: 1280
  },
  {
    id: "NOT-003",
    title: "Online Assessment Slot Confirmation & System Requirements",
    message: "Online coding and cognitive assessments are activated for registered scholars. Ensure webcams and Chrome browsers are updated before 10:00 AM kickoff.",
    type: "Drive Schedule",
    priority: "Important",
    audience: "Shortlisted Students",
    branch: "All",
    driveId: "DRV-202",
    status: "Scheduled",
    createdAt: "2026-09-24 11:30",
    scheduledFor: "2026-09-27 18:00",
    recipientsCount: 18
  },
  {
    id: "NOT-004",
    title: "Eligibility CGPA Relaxation for Civil Core Hiring",
    message: "Cut-off threshold revised to CGPA >= 6.5 for CIVIL engineering applicants for Graduate Site & Projects Trainee vacancies. Interested candidates may apply before Sep 28.",
    type: "Eligibility Update",
    priority: "Normal",
    audience: "Specific Branch",
    branch: "CIVIL",
    driveId: "DRV-208",
    status: "Sent",
    createdAt: "2026-09-22 16:45",
    scheduledFor: null,
    recipientsCount: 100
  },
  {
    id: "NOT-005",
    title: "Pre-Placement Talk (PPT) & Venue Allocation Notice",
    message: "Pre-Placement briefing is slated for Seminar Hall A at 10:00 AM on Sep 28. Formal corporate business attire is strictly required for admission.",
    type: "Drive Schedule",
    priority: "Urgent",
    audience: "Specific Drive",
    branch: "All",
    driveId: "DRV-201",
    status: "Scheduled",
    createdAt: "2026-09-24 12:00",
    scheduledFor: "2026-09-28 08:00",
    recipientsCount: 148
  },
  {
    id: "NOT-006",
    title: "Optimization & Algorithm Assessment Lab Access",
    message: "Shortlisted CSE & MECH applicants are allotted Computer Lab 1. Individual system credentials will be dispatched 15 minutes prior to evaluation.",
    type: "Drive Schedule",
    priority: "Important",
    audience: "Specific Drive",
    branch: "CSE",
    driveId: "DRV-206",
    status: "Draft",
    createdAt: "2026-09-24 15:20",
    scheduledFor: null,
    recipientsCount: 20
  },
  {
    id: "NOT-007",
    title: "Dedicated Mock Interview & Intervention Bootcamp",
    message: "Scholars flagged for placement readiness support are invited to join the special weekend technical review and communication coaching tracks starting this Saturday.",
    type: "General Announcement",
    priority: "Urgent",
    audience: "At-Risk Students",
    branch: "All",
    driveId: null,
    status: "Draft",
    createdAt: "2026-09-24 16:10",
    scheduledFor: null,
    recipientsCount: 45
  },
  {
    id: "NOT-008",
    title: "VLSI Technical Assessment Shortlist Update",
    message: "Shortlist for the Silicon verification interview round is released. Candidates must complete credential confirmations in their student portals before Sep 29.",
    type: "Eligibility Update",
    priority: "Important",
    audience: "Specific Branch",
    branch: "ECE",
    driveId: "DRV-204",
    status: "Sent",
    createdAt: "2026-09-24 17:30",
    scheduledFor: null,
    recipientsCount: 15
  },
  {
    id: "NOT-009",
    title: "Mandatory Registration Notice for Core Branches",
    message: "Mechanical seniors with active registrations must verify their CAD/FEA skill badges prior to the upcoming industrial recruitment week.",
    type: "General Announcement",
    priority: "Normal",
    audience: "Specific Branch",
    branch: "MECH",
    driveId: null,
    status: "Sent",
    createdAt: "2026-09-21 10:00",
    scheduledFor: null,
    recipientsCount: 140
  },
  {
    id: "NOT-010",
    title: "Cloud DevOps Screening Results & Interview Slots",
    message: "Shortlisted applicants from CSE and IT branches for Apex Cloud Technologies must check slot timings for Round 1 technical interviews scheduled for 14:30 at Auditorium 1.",
    type: "Drive Schedule",
    priority: "Urgent",
    audience: "Shortlisted Students",
    branch: "CSE",
    driveId: "DRV-203",
    status: "Sent",
    createdAt: "2026-09-25 08:30",
    scheduledFor: null,
    recipientsCount: 32
  },
  {
    id: "NOT-011",
    title: "Grid Automation & Power Systems Pre-Drive Orientation",
    message: "Electrical Engineering students registered for Voltix Energy Solutions must review the pre-placement orientation slides covering renewable grid interconnect fundamentals.",
    type: "General Announcement",
    priority: "Normal",
    audience: "Specific Branch",
    branch: "EE",
    driveId: "DRV-210",
    status: "Scheduled",
    createdAt: "2026-09-25 14:00",
    scheduledFor: "2026-09-29 16:00",
    recipientsCount: 98
  }
];