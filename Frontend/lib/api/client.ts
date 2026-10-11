// Unified API Client for CampusLink
// Safely queries Express (:5000) or FastAPI (:8000) via Next.js proxy
// Zero-Crash Architecture: Seamlessly falls back to synthetic fixtures if an API is offline

import {
  HERO_STUDENTS,
  ACTIVE_DRIVES,
  SAMPLE_CANDIDATE_MATCHES,
  PLACEMENT_CELL_STATS,
  StudentProfile,
  Drive,
  CandidateMatch,
} from "../data/mockData";

export type UserRole = "student" | "recruiter" | "placement_officer";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  isFallback: boolean;
  message?: string;
}

export async function safeFetch<T>(
  target: "cell" | "recruiter",
  endpoint: string,
  options: RequestInit = {},
  role: UserRole = "student",
  fallbackData: T
): Promise<ApiResponse<T>> {
  const prefix = target === "cell" ? "/api/cell" : "/api/recruiter";
  const url = `${prefix}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Demo-User-Role": role,
    ...(options.headers as Record<string, string> | undefined),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      const payload = json.data !== undefined ? json.data : json;
      return {
        ok: true,
        data: payload as T,
        isFallback: false,
      };
    } else {
      console.warn(`[safeFetch] ${url} responded with status ${res.status}. Using fallback fixtures.`);
      return {
        ok: true,
        data: fallbackData,
        isFallback: true,
        message: `API returned HTTP ${res.status}; served verified demo data`,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[safeFetch] Network error contacting ${url}: ${errorMsg}. Using fallback fixtures.`);
    return {
      ok: true,
      data: fallbackData,
      isFallback: true,
      message: `Offline mode active: ${errorMsg}`,
    };
  }
}

// Client helper functions
export const api = {
  // Student Portal
  getStudentProfile: async (studentId: string = "STU-001"): Promise<ApiResponse<StudentProfile>> => {
    const student = HERO_STUDENTS.find((s) => s.id === studentId) || HERO_STUDENTS[0];
    return safeFetch(
      "cell",
      `/students/${studentId}`,
      { method: "GET" },
      "student",
      student
    );
  },

  getStudentReadiness: async (studentId: string = "STU-001") => {
    const student = HERO_STUDENTS.find((s) => s.id === studentId) || HERO_STUDENTS[0];
    return safeFetch(
      "cell",
      `/readiness/student/${studentId}`,
      { method: "GET" },
      "student",
      student.readiness
    );
  },

  // Drives
  getDrives: async (): Promise<ApiResponse<Drive[]>> => {
    return safeFetch("cell", "/drives", { method: "GET" }, "student", ACTIVE_DRIVES);
  },

  getDriveById: async (driveId: string): Promise<ApiResponse<Drive>> => {
    const drive = ACTIVE_DRIVES.find((d) => d.id === driveId) || ACTIVE_DRIVES[0];
    return safeFetch("cell", `/drives/${driveId}`, { method: "GET" }, "student", drive);
  },

  // Recruiter Portal
  getDriveMatches: async (driveId: string = "DRV-101"): Promise<ApiResponse<CandidateMatch[]>> => {
    return safeFetch(
      "recruiter",
      `/drives/${driveId}/match?include_below_cutoff=true`,
      { method: "GET" },
      "recruiter",
      SAMPLE_CANDIDATE_MATCHES
    );
  },

  parseJobDescription: async (text: string) => {
    const fallbackParse = {
      role: "Associate Cloud Software Engineer",
      must_have: ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
      nice_to_have: ["Kubernetes", "AWS", "Golang"],
      min_cgpa: 8.0,
      max_backlogs: 0,
      branches: ["CSE", "IT", "ECE"],
      batch: 2026,
      ctc_range: "32 - 44 LPA",
      location: "Bangalore",
    };

    return safeFetch(
      "recruiter",
      "/jd/parse",
      {
        method: "POST",
        body: JSON.stringify({ text }),
      },
      "recruiter",
      fallbackParse
    );
  },

  // Placement Cell Portal
  getCellOverview: async () => {
    return safeFetch(
      "cell",
      "/analytics/overview",
      { method: "GET" },
      "placement_officer",
      PLACEMENT_CELL_STATS
    );
  },
};
