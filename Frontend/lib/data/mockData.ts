// Authoritative Mock Simulation Data Layer for CampusLink
// Provides 100% resilient fallback for offline demo day resilience

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  graduationYear: number;
  email: string;
  phone: string;
  avatarUrl?: string;
  skills: { name: string; category: string; proficiency: number; verified: boolean }[];
  projects: { title: string; techStack: string[]; description: string; repoUrl?: string }[];
  assessments: {
    aptitude: number; // /100
    mockInterview: number; // /100
    communication: number; // /100
    domainKnowledge: number; // /100
  };
  readiness: {
    score: number;
    band: "Not Ready" | "Developing" | "Ready" | "Highly Employable";
    summary: string;
    strengths: string[];
    gaps: string[];
    breakdown: {
      factor: string;
      weight: number;
      earned: number;
      detail: string;
    }[];
    counterfactuals: {
      action: string;
      projectedScore: number;
      projectedBand: string;
      delta: number;
    }[];
  };
}

export interface Drive {
  id: string;
  company: string;
  logo: string;
  title: string;
  roleType: string;
  packageLPA: string;
  minCgpa: number;
  maxBacklogs: number;
  branches: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  status: "Draft" | "Registration Open" | "Assessment" | "Interviews" | "Completed";
  date: string;
  appliedCount: number;
  shortlistedCount: number;
  offersCount: number;
  location: string;
}

export interface CandidateMatch {
  studentId: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  rank: number;
  score: number;
  band: "Not Ready" | "Developing" | "Ready" | "Highly Employable";
  hiddenGem: boolean;
  belowCutoff: boolean;
  status: "applied" | "shortlisted" | "aptitude" | "technical" | "hr" | "selected" | "offered" | "accepted" | "joined" | "rejected";
  matchedSkills: string[];
  missingMustHave: string[];
  missingNiceToHave: string[];
  reasons: string[];
  radar: {
    skills: number;
    aptitude: number;
    mockInterview: number;
    cgpa: number;
    projects: number;
    verified: number;
  };
  breakdown: {
    factor: string;
    weight: number;
    earned: number;
  }[];
  offerRisk?: {
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    acceptanceProbability: number;
    factors: { factor: string; impact: "POSITIVE" | "NEGATIVE"; description: string }[];
    recommendedAction: string;
  };
}

export const HERO_STUDENTS: StudentProfile[] = [
  {
    id: "STU-001",
    name: "Ananya Mohanty",
    rollNumber: "2201201045",
    branch: "CSE",
    cgpa: 8.85,
    backlogs: 0,
    graduationYear: 2027,
    email: "ananya.m@bput.ac.in",
    phone: "+91 98765 43210",
    skills: [
      { name: "React", category: "Frontend", proficiency: 5, verified: true },
      { name: "TypeScript", category: "Frontend", proficiency: 4, verified: true },
      { name: "Node.js", category: "Backend", proficiency: 4, verified: true },
      { name: "PostgreSQL", category: "Database", proficiency: 4, verified: true },
      { name: "Python", category: "AI / Data", proficiency: 3, verified: false },
      { name: "Docker", category: "DevOps", proficiency: 2, verified: false },
      { name: "AWS", category: "Cloud", proficiency: 2, verified: false },
    ],
    projects: [
      {
        title: "Distributed Task Queue",
        techStack: ["Node.js", "Redis", "Docker"],
        description: "High-throughput asynchronous job broker processing 5k jobs/sec.",
      },
      {
        title: "Hospital Appointment PWA",
        techStack: ["React", "TypeScript", "PostgreSQL"],
        description: "Patient triage booking platform serving 12 healthcare facilities.",
      },
    ],
    assessments: {
      aptitude: 88,
      mockInterview: 82,
      communication: 90,
      domainKnowledge: 85,
    },
    readiness: {
      score: 82,
      band: "Highly Employable",
      summary:
        "High CGPA with verified Fullstack proficiency and strong communication skills. Primary growth opportunity in cloud virtualization and containerization.",
      strengths: [
        "Consistent academic track record (CGPA 8.85)",
        "Verified core technical skills (React, TypeScript, Node.js)",
        "High aptitude & articulate communication in technical mocks",
      ],
      gaps: [
        "Hands-on production Docker/Kubernetes deployment",
        "Public cloud infrastructure (AWS/GCP) certification",
      ],
      breakdown: [
        { factor: "Technical Skills", weight: 35, earned: 27.5, detail: "Strong core stack, pending containerization" },
        { factor: "Aptitude Score", weight: 15, earned: 13.0, detail: "88th percentile in university cohort" },
        { factor: "Mock Interview", weight: 15, earned: 12.0, detail: "Demonstrated clear architecture design" },
        { factor: "Academic CGPA", weight: 10, earned: 8.85, detail: "Above all recruiter benchmarks" },
        { factor: "Project Relevance", weight: 15, earned: 12.5, detail: "Production grade portfolio with repos" },
        { factor: "Verified Skills", weight: 10, earned: 8.15, detail: "4/7 skills validated via proctored labs" },
      ],
      counterfactuals: [
        {
          action: "Complete Docker & Container Fundamentals",
          projectedScore: 89.2,
          projectedBand: "Highly Employable",
          delta: 6.7,
        },
        {
          action: "Pass AWS Cloud Practitioner Proctored Exam",
          projectedScore: 92.4,
          projectedBand: "Highly Employable",
          delta: 9.9,
        },
      ],
    },
  },
  {
    id: "STU-002",
    name: "Subham Panda",
    rollNumber: "2201201089",
    branch: "IT",
    cgpa: 6.82, // Below 7.0 cutoff -> Potential Hidden Gem!
    backlogs: 0,
    graduationYear: 2026,
    email: "subham.p@bput.ac.in",
    phone: "+91 98765 43211",
    skills: [
      { name: "Golang", category: "Backend", proficiency: 5, verified: true },
      { name: "Kubernetes", category: "DevOps", proficiency: 5, verified: true },
      { name: "Docker", category: "DevOps", proficiency: 5, verified: true },
      { name: "PostgreSQL", category: "Database", proficiency: 4, verified: true },
      { name: "gRPC", category: "Networking", proficiency: 4, verified: true },
      { name: "Python", category: "Backend", proficiency: 4, verified: true },
    ],
    projects: [
      {
        title: "K8s Microservice Ingress Controller",
        techStack: ["Golang", "Kubernetes", "Docker", "eBPF"],
        description: "Custom ingress controller with dynamic canary routing and 100k requests/sec throughput.",
      },
      {
        title: "Distributed Key-Value Store",
        techStack: ["Golang", "Raft", "gRPC"],
        description: "Implemented Raft consensus algorithm from scratch with automated leader election.",
      },
    ],
    assessments: {
      aptitude: 92,
      mockInterview: 95,
      communication: 78,
      domainKnowledge: 96,
    },
    readiness: {
      score: 84.0,
      band: "Highly Employable",
      summary:
        "Exceptional systems engineering capabilities, advanced DevOps architecture, and perfect technical mock score. CGPA falls just below traditional 7.0 cutoff, creating a prime 'Hidden Gem' opportunity.",
      strengths: [
        "Elite backend & systems engineering mastery (Go, Raft, K8s)",
        "Top 1% technical mock interview score (95/100)",
        "Production-ready open source contributions",
      ],
      gaps: ["CGPA is 6.82, requiring cutoff relaxation flag"],
      breakdown: [
        { factor: "Technical Skills", weight: 35, earned: 34.5, detail: "Near perfect system stack alignment" },
        { factor: "Aptitude Score", weight: 15, earned: 13.8, detail: "92nd percentile" },
        { factor: "Mock Interview", weight: 15, earned: 14.25, detail: "Flawless live system design" },
        { factor: "Academic CGPA", weight: 10, earned: 6.82, detail: "Slightly below 7.0 standard cutoff" },
        { factor: "Project Relevance", weight: 15, earned: 15.0, detail: "Highest quality project repo in branch" },
        { factor: "Verified Skills", weight: 10, earned: 10.0, detail: "All core systems skills proctor verified" },
      ],
      counterfactuals: [
        {
          action: "Placement Cell Special Exemption Flag",
          projectedScore: 88.5,
          projectedBand: "Highly Employable",
          delta: 4.5,
        },
      ],
    },
  },
  {
    id: "STU-003",
    name: "Priya Sharma",
    rollNumber: "2201202012",
    branch: "ECE",
    cgpa: 8.45,
    backlogs: 0,
    graduationYear: 2026,
    email: "priya.s@bput.ac.in",
    phone: "+91 98765 43212",
    skills: [
      { name: "C++", category: "Embedded", proficiency: 4, verified: true },
      { name: "Python", category: "AI / Data", proficiency: 4, verified: true },
      { name: "TensorFlow", category: "ML", proficiency: 3, verified: false },
      { name: "Verilog", category: "VLSI", proficiency: 4, verified: true },
      { name: "RTOS", category: "Embedded", proficiency: 3, verified: false },
    ],
    projects: [
      {
        title: "Edge AI Traffic Monitoring",
        techStack: ["Python", "TensorFlow", "Raspberry Pi", "OpenCV"],
        description: "Real-time vehicle detection on low-power edge accelerator.",
      },
    ],
    assessments: {
      aptitude: 82,
      mockInterview: 78,
      communication: 86,
      domainKnowledge: 84,
    },
    readiness: {
      score: 76.5,
      band: "Ready",
      summary: "Strong intersection of Embedded systems and Edge AI with solid academics.",
      strengths: ["Strong C++ and Python fundamentals", "Good blend of hardware and software"],
      gaps: ["Cloud and full-stack web integration"],
      breakdown: [
        { factor: "Technical Skills", weight: 35, earned: 27.0, detail: "Good embedded & AI fundamentals" },
        { factor: "Aptitude Score", weight: 15, earned: 12.3, detail: "Above benchmark" },
        { factor: "Mock Interview", weight: 15, earned: 11.7, detail: "Strong problem solving" },
        { factor: "Academic CGPA", weight: 10, earned: 8.45, detail: "Strong academic record" },
        { factor: "Project Relevance", weight: 15, earned: 11.0, detail: "Good edge AI hardware project" },
        { factor: "Verified Skills", weight: 10, earned: 6.0, detail: "3 verified competencies" },
      ],
      counterfactuals: [
        {
          action: "Deploy model via FastAPI and Docker",
          projectedScore: 83.2,
          projectedBand: "Highly Employable",
          delta: 6.7,
        },
      ],
    },
  },
  {
    id: "STU-004",
    name: "Rohan Das",
    rollNumber: "2201201099",
    branch: "CSE",
    cgpa: 7.4,
    backlogs: 0,
    graduationYear: 2026,
    email: "rohan.d@bput.ac.in",
    phone: "+91 98765 43213",
    skills: [
      { name: "Java", category: "Backend", proficiency: 4, verified: true },
      { name: "Spring Boot", category: "Backend", proficiency: 4, verified: true },
      { name: "MySQL", category: "Database", proficiency: 4, verified: true },
      { name: "Kafka", category: "Messaging", proficiency: 3, verified: false },
    ],
    projects: [
      {
        title: "E-Commerce Microservices",
        techStack: ["Java", "Spring Boot", "Kafka", "MySQL"],
        description: "Event-driven architecture with order fulfillment and inventory tracking.",
      },
    ],
    assessments: {
      aptitude: 76,
      mockInterview: 74,
      communication: 72,
      domainKnowledge: 78,
    },
    readiness: {
      score: 72.0,
      band: "Ready",
      summary: "Solid enterprise Java backend skillset with clear database and REST foundations.",
      strengths: ["Enterprise Java ecosystem knowledge", "Clean API design patterns"],
      gaps: ["Frontend fluency and cloud deployments"],
      breakdown: [
        { factor: "Technical Skills", weight: 35, earned: 26.0, detail: "Solid Spring Boot foundation" },
        { factor: "Aptitude Score", weight: 15, earned: 11.4, detail: "Meets standard threshold" },
        { factor: "Mock Interview", weight: 15, earned: 11.1, detail: "Solid OOP explanations" },
        { factor: "Academic CGPA", weight: 10, earned: 7.4, detail: "Consistent score" },
        { factor: "Project Relevance", weight: 15, earned: 10.5, detail: "Standard microservices design" },
        { factor: "Verified Skills", weight: 10, earned: 6.0, detail: "3 verified skills" },
      ],
      counterfactuals: [
        {
          action: "Build React frontend for fullstack capstone",
          projectedScore: 78.5,
          projectedBand: "Ready",
          delta: 6.5,
        },
      ],
    },
  },
  {
    id: "STU-005",
    name: "Sneha Roy",
    rollNumber: "2201203023",
    branch: "IT",
    cgpa: 6.1,
    backlogs: 1, // At risk candidate for placement cell
    graduationYear: 2026,
    email: "sneha.r@bput.ac.in",
    phone: "+91 98765 43214",
    skills: [
      { name: "HTML/CSS", category: "Frontend", proficiency: 3, verified: true },
      { name: "JavaScript", category: "Frontend", proficiency: 2, verified: false },
      { name: "SQL", category: "Database", proficiency: 2, verified: false },
    ],
    projects: [
      {
        title: "Portfolio Website",
        techStack: ["HTML", "CSS", "JavaScript"],
        description: "Static responsive personal landing page.",
      },
    ],
    assessments: {
      aptitude: 58,
      mockInterview: 52,
      communication: 65,
      domainKnowledge: 55,
    },
    readiness: {
      score: 48.0,
      band: "Developing",
      summary: "At-risk profile due to backlog and foundational technical gaps. Recommended for remedial placement mentoring.",
      strengths: ["Good presentation and interpersonal communication"],
      gaps: ["Backlog clearance required", "Core data structures & algorithms weakness", "Absence of modern framework"],
      breakdown: [
        { factor: "Technical Skills", weight: 35, earned: 14.0, detail: "Basic web only" },
        { factor: "Aptitude Score", weight: 15, earned: 8.7, detail: "Below 60% cutoff" },
        { factor: "Mock Interview", weight: 15, earned: 7.8, detail: "Struggled with algorithmic problem" },
        { factor: "Academic CGPA", weight: 10, earned: 6.1, detail: "1 active backlog" },
        { factor: "Project Relevance", weight: 15, earned: 6.5, detail: "Static project only" },
        { factor: "Verified Skills", weight: 10, earned: 2.0, detail: "Only basic HTML verified" },
      ],
      counterfactuals: [
        {
          action: "Clear backlog & complete 4-week React Bootcamp",
          projectedScore: 68.4,
          projectedBand: "Ready",
          delta: 20.4,
        },
      ],
    },
  },
];

export const ACTIVE_DRIVES: Drive[] = [
  {
    id: "DRV-101",
    company: "Apex Cloud Technologies",
    logo: "AC",
    title: "Associate Cloud & Backend Engineer",
    roleType: "Full-Time (Core)",
    packageLPA: "32.0 - 44.0 LPA",
    minCgpa: 8.0,
    maxBacklogs: 0,
    branches: ["CSE", "IT", "ECE"],
    mustHaveSkills: ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
    niceToHaveSkills: ["Kubernetes", "AWS", "Golang", "Redis"],
    status: "Interviews",
    date: "Oct 18, 2026",
    appliedCount: 184,
    shortlistedCount: 38,
    offersCount: 8,
    location: "Bangalore / Hybrid",
  },
  {
    id: "DRV-102",
    company: "Nexus Core Systems",
    logo: "NC",
    title: "Distributed Systems & SRE Specialist",
    roleType: "Full-Time (R&D)",
    packageLPA: "24.0 - 34.0 LPA",
    minCgpa: 7.5,
    maxBacklogs: 0,
    branches: ["CSE", "IT"],
    mustHaveSkills: ["Golang", "Docker", "Kubernetes", "PostgreSQL"],
    niceToHaveSkills: ["gRPC", "eBPF", "Kafka", "Linux Internals"],
    status: "Assessment",
    date: "Oct 22, 2026",
    appliedCount: 220,
    shortlistedCount: 45,
    offersCount: 5,
    location: "Hyderabad",
  },
  {
    id: "DRV-103",
    company: "Zenith Digital Services",
    logo: "ZD",
    title: "Full Stack Software Analyst",
    roleType: "Full-Time (Mass+)",
    packageLPA: "8.5 - 12.0 LPA",
    minCgpa: 6.5,
    maxBacklogs: 0,
    branches: ["CSE", "IT", "ECE", "EEE", "Mech", "Civil"],
    mustHaveSkills: ["JavaScript", "Java", "SQL"],
    niceToHaveSkills: ["React", "Spring Boot", "Git"],
    status: "Registration Open",
    date: "Oct 28, 2026",
    appliedCount: 640,
    shortlistedCount: 140,
    offersCount: 32,
    location: "Bhubaneswar / Pune",
  },
  {
    id: "DRV-104",
    company: "Titan Heavy Engineering",
    logo: "TH",
    title: "Smart Automation & Embedded Engineer",
    roleType: "Core Engineering",
    packageLPA: "7.0 - 9.5 LPA",
    minCgpa: 6.0,
    maxBacklogs: 1,
    branches: ["ECE", "EEE", "Mech", "Civil"],
    mustHaveSkills: ["C++", "RTOS", "Verilog"],
    niceToHaveSkills: ["Python", "MATLAB", "IoT"],
    status: "Registration Open",
    date: "Nov 02, 2026",
    appliedCount: 195,
    shortlistedCount: 50,
    offersCount: 12,
    location: "Jamshedpur / Rourkela",
  },
];

export const SAMPLE_CANDIDATE_MATCHES: CandidateMatch[] = [
  {
    studentId: "STU-001",
    studentName: "Ananya Mohanty",
    rollNumber: "2201201045",
    branch: "CSE",
    cgpa: 8.85,
    rank: 1,
    score: 87.2,
    band: "Highly Employable",
    hiddenGem: false,
    belowCutoff: false,
    status: "shortlisted",
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    missingMustHave: ["Docker"],
    missingNiceToHave: ["Kubernetes", "AWS"],
    reasons: [
      "Meets CGPA benchmark (8.85 >= 8.0)",
      "Matched 4 of 5 must-have core skills",
      "Mock interview score (82) in top tier",
    ],
    radar: {
      skills: 88,
      aptitude: 88,
      mockInterview: 82,
      cgpa: 88,
      projects: 84,
      verified: 80,
    },
    breakdown: [
      { factor: "Skills Match", weight: 35, earned: 29.5 },
      { factor: "Aptitude", weight: 15, earned: 13.2 },
      { factor: "Mock Interview", weight: 15, earned: 12.3 },
      { factor: "Academic CGPA", weight: 10, earned: 8.85 },
      { factor: "Projects", weight: 15, earned: 12.5 },
      { factor: "Verified Credentials", weight: 10, earned: 8.0 },
    ],
    offerRisk: {
      riskLevel: "LOW",
      acceptanceProbability: 92,
      factors: [
        { factor: "Location Preference", impact: "POSITIVE", description: "Bangalore is candidate 1st preference" },
        { factor: "Compensation Match", impact: "POSITIVE", description: "44 LPA exceeds salary expectations" },
      ],
      recommendedAction: "Expedite technical round scheduling; candidate highly motivated.",
    },
  },
  {
    studentId: "STU-002",
    studentName: "Subham Panda",
    rollNumber: "2201201089",
    branch: "IT",
    cgpa: 6.82, // Below 8.0 cutoff for Apex, but supreme skills!
    rank: 2,
    score: 86.8,
    band: "Highly Employable",
    hiddenGem: true,
    belowCutoff: true,
    status: "applied",
    matchedSkills: ["Docker", "Kubernetes", "PostgreSQL", "Golang"],
    missingMustHave: ["React"],
    missingNiceToHave: ["AWS"],
    reasons: [
      "Non-topper candidate: Exceptional backend & Docker/K8s expertise",
      "95/100 Mock interview score outperforms cohort",
      "CGPA 6.82 is below 8.0 filter; recommended for waiver",
    ],
    radar: {
      skills: 98,
      aptitude: 92,
      mockInterview: 95,
      cgpa: 68,
      projects: 100,
      verified: 95,
    },
    breakdown: [
      { factor: "Skills Match", weight: 35, earned: 33.5 },
      { factor: "Aptitude", weight: 15, earned: 13.8 },
      { factor: "Mock Interview", weight: 15, earned: 14.25 },
      { factor: "Academic CGPA", weight: 10, earned: 6.82 },
      { factor: "Projects", weight: 15, earned: 15.0 },
      { factor: "Verified Credentials", weight: 10, earned: 9.5 },
    ],
    offerRisk: {
      riskLevel: "MEDIUM",
      acceptanceProbability: 74,
      factors: [
        { factor: "Competing Offers", impact: "NEGATIVE", description: "Active final round with Nexus Core Systems" },
        { factor: "Role Alignment", impact: "POSITIVE", description: "Loves Kubernetes and distributed backend" },
      ],
      recommendedAction: "Offer early spot to counter competing offers.",
    },
  },
  {
    studentId: "STU-003",
    studentName: "Priya Sharma",
    rollNumber: "2201202012",
    branch: "ECE",
    cgpa: 8.45,
    rank: 3,
    score: 75.4,
    band: "Ready",
    hiddenGem: false,
    belowCutoff: false,
    status: "shortlisted",
    matchedSkills: ["Python"],
    missingMustHave: ["React", "TypeScript", "Node.js", "Docker"],
    missingNiceToHave: ["Kubernetes", "AWS"],
    reasons: [
      "Strong academic standing (CGPA 8.45)",
      "High analytical aptitude",
      "Gaps in web technologies require 2-week ramp-up",
    ],
    radar: {
      skills: 64,
      aptitude: 82,
      mockInterview: 78,
      cgpa: 84,
      projects: 72,
      verified: 65,
    },
    breakdown: [
      { factor: "Skills Match", weight: 35, earned: 22.0 },
      { factor: "Aptitude", weight: 15, earned: 12.3 },
      { factor: "Mock Interview", weight: 15, earned: 11.7 },
      { factor: "Academic CGPA", weight: 10, earned: 8.45 },
      { factor: "Projects", weight: 15, earned: 11.0 },
      { factor: "Verified Credentials", weight: 10, earned: 6.5 },
    ],
  },
  {
    studentId: "STU-004",
    studentName: "Rohan Das",
    rollNumber: "2201201099",
    branch: "CSE",
    cgpa: 7.4,
    rank: 4,
    score: 71.8,
    band: "Ready",
    hiddenGem: false,
    belowCutoff: true,
    status: "applied",
    matchedSkills: ["PostgreSQL"],
    missingMustHave: ["React", "TypeScript", "Docker"],
    missingNiceToHave: ["Kubernetes"],
    reasons: ["Solid backend instincts, Java background"],
    radar: {
      skills: 70,
      aptitude: 76,
      mockInterview: 74,
      cgpa: 74,
      projects: 70,
      verified: 60,
    },
    breakdown: [
      { factor: "Skills Match", weight: 35, earned: 21.0 },
      { factor: "Aptitude", weight: 15, earned: 11.4 },
      { factor: "Mock Interview", weight: 15, earned: 11.1 },
      { factor: "Academic CGPA", weight: 10, earned: 7.4 },
      { factor: "Projects", weight: 15, earned: 10.5 },
      { factor: "Verified Credentials", weight: 10, earned: 6.0 },
    ],
  },
];

export const PLACEMENT_CELL_STATS = {
  totalStudents: 1280,
  studentsPlaced: 896,
  placementRate: 70.0,
  averagePackageLPA: 8.4,
  highestPackageLPA: 44.0,
  activeDrivesCount: 14,
  atRiskCount: 68,
  branchWiseConversion: [
    { branch: "CSE", total: 360, placed: 310, rate: 86.1, avgLpa: 11.2 },
    { branch: "IT", total: 240, placed: 198, rate: 82.5, avgLpa: 9.8 },
    { branch: "ECE", total: 280, placed: 196, rate: 70.0, avgLpa: 7.9 },
    { branch: "EE", total: 160, placed: 94, rate: 58.75, avgLpa: 6.5 },
    { branch: "MECH", total: 140, placed: 58, rate: 41.4, avgLpa: 6.2 },
    { branch: "CIVIL", total: 100, placed: 40, rate: 40.0, avgLpa: 5.8 },
  ],
  salaryTrends: [
    { year: "2022", avg: 6.1, highest: 32.0 },
    { year: "2023", avg: 7.2, highest: 38.5 },
    { year: "2024", avg: 7.9, highest: 42.0 },
    { year: "2025", avg: 8.4, highest: 44.0 },
    { year: "2026 (Est.)", avg: 9.2, highest: 48.0 },
  ],
  curriculumGaps: [
    {
      skill: "Docker & Cloud Virtualization",
      industryDemand: 78,
      studentSupply: 28,
      gapDelta: -50,
      recommendedCourse: "4-Week Practical Cloud Native & DevOps Bootcamp",
      priority: "CRITICAL",
    },
    {
      skill: "System Design & Microservices",
      industryDemand: 65,
      studentSupply: 32,
      gapDelta: -33,
      recommendedCourse: "Distributed Systems Architecture Lab Series",
      priority: "HIGH",
    },
    {
      skill: "TypeScript & Next.js",
      industryDemand: 82,
      studentSupply: 54,
      gapDelta: -28,
      recommendedCourse: "Modern Production Web Standards Workshop",
      priority: "MEDIUM",
    },
  ],
};
