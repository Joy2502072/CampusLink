"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  const router = useRouter();
  const [heroIn, setHeroIn] = useState(false);

  // Student credentials
  const [studentRoll, setStudentRoll] = useState("2505064");
  const [studentPass, setStudentPass] = useState("12345");
  const [studentErr, setStudentErr] = useState("");

  // Recruiter credentials
  const [recruiterCompany, setRecruiterCompany] = useState("TCS");
  const [recruiterPin, setRecruiterPin] = useState("12345");
  const [recruiterErr, setRecruiterErr] = useState("");

  // Placement cell credentials
  const [cellCollege, setCellCollege] = useState("GEC");
  const [cellPin, setCellPin] = useState("12345");
  const [cellErr, setCellErr] = useState("");

  // Loading states
  const [loadingPortal, setLoadingPortal] = useState<string | null>(null);

  // Trigger hero animation on mount
  useEffect(() => {
    setHeroIn(true);
  }, []);

  const handleMouseMove = (e: React.PointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--x", `${e.clientX - rect.left}px`);
    target.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  // Student portal submission
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRoll.trim() || !studentPass.trim()) {
      setStudentErr("Please enter both Roll Number and Password.");
      return;
    }
    setStudentErr("");
    setLoadingPortal("student");
    setTimeout(() => {
      router.push("/student");
    }, 400);
  };

  // Recruiter portal submission
  const handleRecruiterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterCompany.trim() || !recruiterPin.trim()) {
      setRecruiterErr("Please enter both Company Name and Security PIN.");
      return;
    }
    setRecruiterErr("");
    setLoadingPortal("recruiter");
    setTimeout(() => {
      router.push("/recruiter");
    }, 400);
  };

  // Placement Cell portal submission
  const handleCellLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellCollege.trim() || !cellPin.trim()) {
      setCellErr("Please enter both College Name and Officer PIN.");
      return;
    }
    setCellErr("");
    setLoadingPortal("cell");
    setTimeout(() => {
      router.push("/cell");
    }, 400);
  };

  return (
    <AppShell>
      <div className="space-y-12">
        {/* ===================== HERO SECTION ===================== */}
        <section className={`hero relative py-10 sm:py-14 overflow-hidden ${heroIn ? "in" : ""}`} id="hero">
          {/* Ambient Mesh Background */}
          <div className="mesh" aria-hidden="true">
            <i className="blob b1" />
            <i className="blob b2" />
            <i className="blob b3" />
          </div>

          <div className="relative z-10 hero-in text-center max-w-3xl mx-auto">
            <p className="eyebrow font-mono text-[12px] text-ink-3 tracking-wide mb-3">
              CampusLink · BPUT 2026 PS10 · Unified Placement Gateway
            </p>

            <h1 className="display text-ink mx-auto max-w-[18ch]">
              <span className="w" style={{ "--i": 0 } as React.CSSProperties}>Placement,</span>{" "}
              <span className="w" style={{ "--i": 1 } as React.CSSProperties}>
                <span className="uline">
                  explained
                  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                    <path pathLength="1" d="M2 8 C 40 2, 80 12, 120 6 S 180 4, 198 7" />
                  </svg>
                </span>
              </span>{" "}
              <span className="w" style={{ "--i": 2 } as React.CSSProperties}>clearly.</span>
            </h1>

            <p className="lede text-ink-2 text-[16px] sm:text-[17px] max-w-[56ch] mx-auto mt-4 leading-relaxed">
              Select your portal below to enter with role credentials. Experience multi-factor matching,
              what-if simulation, and conflict-aware scheduling.
            </p>
          </div>
        </section>

        {/* ===================== 3 AUTHENTICATED PORTALS SECTION ===================== */}
        <section className="space-y-4">
          <div className="sec-h flex items-baseline justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span className="sec-n font-mono text-[12px] text-ink-3">01</span>
              <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
                Choose your portal
              </h2>
            </div>
            <span className="text-[12px] text-ink-3">
              Credentials pre-filled for instant hackathon evaluation
            </span>
          </div>

          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Three dedicated gateways with specific authentication criteria for Students (Roll + Password),
            Corporate Recruiters (Company + PIN), and University Placement Officers (College + PIN).
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-3">
            {/* ================= PORTAL 1: STUDENT ================= */}
            <article
              className="spot flex flex-col justify-between"
              onPointerMove={handleMouseMove}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="tile t-mint mb-0">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 10 12 5 2 10l10 5 10-5z" />
                      <path d="M6 12v5c3 2 9 2 12 0v-5" />
                    </svg>
                  </div>
                  <span className="chip ok text-[11px]">Student Portal</span>
                </div>

                <h3 className="font-display text-[20px] font-semibold text-ink mb-1">
                  Student Gateway
                </h3>
                <p className="text-ink-2 text-[13px] mb-4 leading-relaxed">
                  Log in with your roll number to access readiness scores, verified competencies & apply to drives.
                </p>

                <form onSubmit={handleStudentLogin} className="space-y-3">
                  <div className="fld">
                    <label htmlFor="stu-roll">University Roll Number</label>
                    <input
                      id="stu-roll"
                      type="text"
                      className="inp mono text-[13px]"
                      placeholder="e.g. 2505064"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fld">
                    <label htmlFor="stu-pass">Student Password</label>
                    <input
                      id="stu-pass"
                      type="password"
                      className="inp text-[13px]"
                      placeholder="e.g. 12345"
                      value={studentPass}
                      onChange={(e) => setStudentPass(e.target.value)}
                      required
                    />
                  </div>

                  {studentErr && (
                    <p className="text-[12px] text-coral-ink">{studentErr}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingPortal === "student"}
                      className="btn btn-primary w-full text-[13px]"
                    >
                      {loadingPortal === "student" ? (
                        <span>Entering Student Portal...</span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-center">
                          <span>Enter Student Portal</span>
                          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[2] fill-none">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-ink-3">
                <span>Roll: 2505064 / Pass: 12345</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentRoll("2505064");
                    setStudentPass("12345");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Quick Fill
                </button>
              </div>
            </article>

            {/* ================= PORTAL 2: RECRUITER ================= */}
            <article
              className="spot flex flex-col justify-between"
              onPointerMove={handleMouseMove}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="tile t-pri mb-0">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    </svg>
                  </div>
                  <span className="chip pri text-[11px]">Recruiter Portal</span>
                </div>

                <h3 className="font-display text-[20px] font-semibold text-ink mb-1">
                  Recruiter Gateway
                </h3>
                <p className="text-ink-2 text-[13px] mb-4 leading-relaxed">
                  Log in with company details to steer candidate matching, discover hidden gems & parse natural JDs.
                </p>

                <form onSubmit={handleRecruiterLogin} className="space-y-3">
                  <div className="fld">
                    <label htmlFor="rec-comp">Company / Firm Name</label>
                    <input
                      id="rec-comp"
                      type="text"
                      className="inp text-[13px]"
                      placeholder="e.g. TCS"
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fld">
                    <label htmlFor="rec-pin">Security PIN</label>
                    <input
                      id="rec-pin"
                      type="password"
                      className="inp mono text-[13px]"
                      placeholder="e.g. 12345"
                      value={recruiterPin}
                      onChange={(e) => setRecruiterPin(e.target.value)}
                      required
                    />
                  </div>

                  {recruiterErr && (
                    <p className="text-[12px] text-coral-ink">{recruiterErr}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingPortal === "recruiter"}
                      className="btn btn-primary w-full text-[13px]"
                    >
                      {loadingPortal === "recruiter" ? (
                        <span>Entering Recruiter Portal...</span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-center">
                          <span>Enter Recruiter Portal</span>
                          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[2] fill-none">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-ink-3">
                <span>Company: TCS / PIN: 12345</span>
                <button
                  type="button"
                  onClick={() => {
                    setRecruiterCompany("TCS");
                    setRecruiterPin("12345");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Quick Fill
                </button>
              </div>
            </article>

            {/* ================= PORTAL 3: PLACEMENT CELL ================= */}
            <article
              className="spot flex flex-col justify-between"
              onPointerMove={handleMouseMove}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="tile t-peach mb-0">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <span className="chip warn text-[11px]">Placement Cell</span>
                </div>

                <h3 className="font-display text-[20px] font-semibold text-ink mb-1">
                  Placement Cell Gateway
                </h3>
                <p className="text-ink-2 text-[13px] mb-4 leading-relaxed">
                  Log in with university credentials to manage venue schedules, resolve clashes & track placement stats.
                </p>

                <form onSubmit={handleCellLogin} className="space-y-3">
                  <div className="fld">
                    <label htmlFor="cell-col">College / University Name</label>
                    <input
                      id="cell-col"
                      type="text"
                      className="inp text-[13px]"
                      placeholder="e.g. GEC"
                      value={cellCollege}
                      onChange={(e) => setCellCollege(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fld">
                    <label htmlFor="cell-pin">Officer Security PIN</label>
                    <input
                      id="cell-pin"
                      type="password"
                      className="inp mono text-[13px]"
                      placeholder="e.g. 12345"
                      value={cellPin}
                      onChange={(e) => setCellPin(e.target.value)}
                      required
                    />
                  </div>

                  {cellErr && (
                    <p className="text-[12px] text-coral-ink">{cellErr}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingPortal === "cell"}
                      className="btn btn-primary w-full text-[13px]"
                    >
                      {loadingPortal === "cell" ? (
                        <span>Entering Placement Cell...</span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-center">
                          <span>Enter Placement Cell</span>
                          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[2] fill-none">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-ink-3">
                <span>College: GEC / PIN: 12345</span>
                <button
                  type="button"
                  onClick={() => {
                    setCellCollege("GEC");
                    setCellPin("12345");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Quick Fill
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* ===================== EVALUATION / QUICK ACCESS BAR ===================== */}
        <section className="card flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-surface-2 border border-line">
          <div>
            <div className="text-[14px] font-semibold text-ink">
              Looking for Technical Verification & Algorithms?
            </div>
            <div className="text-[13px] text-ink-3 mt-0.5">
              Review multi-factor scoring equations, request proxy flow & baseline comparison proofs.
            </div>
          </div>
          <Link href="/system" className="btn btn-ghost sm whitespace-nowrap">
            Open Judges' Corner →
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
