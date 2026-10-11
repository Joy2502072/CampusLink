/**
 * CampusLink Backend - In-Memory Synthetic Offer & Document Dataset
 * 
 * NOTICE:
 * All records herein are purely synthetic and generated for demonstration purposes.
 * Identifiers (OFR-XXX, DEMO-STU-XXX, DRV-XXX), corporate names, and figures
 * are fictitious. No real personal or confidential records are included.
 */

export const offers = [
  {
    id: "OFR-101",
    studentId: "DEMO-STU-001",
    studentName: "Demo Student A",
    driveId: "DRV-201",
    company: "Aether Dynamics",
    role: "Full Stack Platform Engineer",
    packageLPA: 18.5,
    offerDate: "2026-09-29",
    joiningDate: "2026-11-01",
    status: "Accepted",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Submitted", required: false },
      { type: "Offer Letter", status: "Submitted", required: true },
      { type: "Bank Details", status: "Submitted", required: true }
    ]
  },
  {
    id: "OFR-102",
    studentId: "DEMO-STU-001",
    studentName: "Demo Student A",
    driveId: "DRV-203",
    company: "Apex Cloud Technologies",
    role: "Cloud DevOps Associate",
    packageLPA: 22.0,
    offerDate: "2026-09-30",
    joiningDate: "2026-11-15",
    status: "Offered",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Submitted", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Pending", required: false },
      { type: "Offer Letter", status: "Pending", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  },
  {
    id: "OFR-103",
    studentId: "DEMO-STU-002",
    studentName: "Demo Student B",
    driveId: "DRV-202",
    company: "Krypton Cyber Security",
    role: "SOC Analyst & Pentester",
    packageLPA: 14.0,
    offerDate: "2026-09-29",
    joiningDate: "2026-10-25",
    status: "Joining Confirmed",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Verified", required: true },
      { type: "Degree Certificate", status: "Verified", required: true },
      { type: "Passport Photo", status: "Verified", required: false },
      { type: "Offer Letter", status: "Verified", required: true },
      { type: "Bank Details", status: "Verified", required: true }
    ]
  },
  {
    id: "OFR-104",
    studentId: "DEMO-STU-003",
    studentName: "Demo Student C",
    driveId: "DRV-204",
    company: "Vanguard Microelectronics",
    role: "VLSI Verification Engineer",
    packageLPA: 16.5,
    offerDate: "2026-09-30",
    joiningDate: "2026-11-10",
    status: "Accepted",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Verified", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Submitted", required: false },
      { type: "Offer Letter", status: "Submitted", required: true },
      { type: "Bank Details", status: "Submitted", required: true }
    ]
  },
  {
    id: "OFR-105",
    studentId: "DEMO-STU-003",
    studentName: "Demo Student C",
    driveId: "DRV-205",
    company: "Quantix Semiconductor",
    role: "Silicon Design Trainee",
    packageLPA: 19.0,
    offerDate: "2026-10-01",
    joiningDate: "2026-12-01",
    status: "Joining Confirmed",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Verified", required: true },
      { type: "Degree Certificate", status: "Verified", required: true },
      { type: "Passport Photo", status: "Verified", required: false },
      { type: "Offer Letter", status: "Verified", required: true },
      { type: "Bank Details", status: "Verified", required: true }
    ]
  },
  {
    id: "OFR-106",
    studentId: "DEMO-STU-006",
    studentName: "Demo Student F",
    driveId: "DRV-208",
    company: "Starlight Infrastructure",
    role: "Structural Projects Engineer",
    packageLPA: 8.5,
    offerDate: "2026-09-30",
    joiningDate: "2026-11-05",
    status: "Accepted",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Pending", required: false },
      { type: "Offer Letter", status: "Submitted", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  },
  {
    id: "OFR-107",
    studentId: "DEMO-STU-007",
    studentName: "Demo Student G",
    driveId: "DRV-201",
    company: "Aether Dynamics",
    role: "Full Stack Platform Engineer",
    packageLPA: 18.5,
    offerDate: "2026-09-29",
    joiningDate: "2026-11-01",
    status: "Withdrawn",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Pending", required: true },
      { type: "Academic Marksheet", status: "Pending", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Pending", required: false },
      { type: "Offer Letter", status: "Pending", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  },
  {
    id: "OFR-108",
    studentId: "DEMO-STU-007",
    studentName: "Demo Student G",
    driveId: "DRV-203",
    company: "Apex Cloud Technologies",
    role: "Cloud DevOps Associate",
    packageLPA: 22.0,
    offerDate: "2026-09-30",
    joiningDate: "2026-11-15",
    status: "Joining Confirmed",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Verified", required: true },
      { type: "Degree Certificate", status: "Verified", required: true },
      { type: "Passport Photo", status: "Verified", required: false },
      { type: "Offer Letter", status: "Verified", required: true },
      { type: "Bank Details", status: "Verified", required: true }
    ]
  },
  {
    id: "OFR-109",
    studentId: "DEMO-STU-008",
    studentName: "Demo Student H",
    driveId: "DRV-206",
    company: "Matrix Logistics AI",
    role: "Optimization Algorithm Engineer",
    packageLPA: 12.5,
    offerDate: "2026-09-30",
    joiningDate: "2026-11-20",
    status: "Offered",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Submitted", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Pending", required: false },
      { type: "Offer Letter", status: "Pending", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  },
  {
    id: "OFR-110",
    studentId: "DEMO-STU-010",
    studentName: "Demo Student J",
    driveId: "DRV-209",
    company: "Nexis Health Data",
    role: "Bio-Informatics Data Analyst",
    packageLPA: 15.0,
    offerDate: "2026-10-01",
    joiningDate: "2026-11-15",
    status: "Accepted",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Submitted", required: false },
      { type: "Offer Letter", status: "Submitted", required: true },
      { type: "Bank Details", status: "Submitted", required: true }
    ]
  },
  {
    id: "OFR-111",
    studentId: "DEMO-STU-011",
    studentName: "Demo Student K",
    driveId: "DRV-210",
    company: "Voltix Energy Solutions",
    role: "Grid Trainee Engineer",
    packageLPA: 10.5,
    offerDate: "2026-10-02",
    joiningDate: "2026-12-05",
    status: "Offered",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Submitted", required: true },
      { type: "Academic Marksheet", status: "Pending", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Pending", required: false },
      { type: "Offer Letter", status: "Pending", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  },
  {
    id: "OFR-112",
    studentId: "DEMO-STU-012",
    studentName: "Demo Student L",
    driveId: "DRV-207",
    company: "Hyperion Robotics",
    role: "Automation Controls Trainee",
    packageLPA: 11.0,
    offerDate: "2026-10-01",
    joiningDate: "2026-11-20",
    status: "Accepted",
    documents: [
      { type: "Resume", status: "Verified", required: true },
      { type: "Government ID", status: "Verified", required: true },
      { type: "Academic Marksheet", status: "Submitted", required: true },
      { type: "Degree Certificate", status: "Pending", required: true },
      { type: "Passport Photo", status: "Submitted", required: false },
      { type: "Offer Letter", status: "Submitted", required: true },
      { type: "Bank Details", status: "Pending", required: true }
    ]
  }
];