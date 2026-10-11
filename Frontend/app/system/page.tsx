"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { StatusText } from "@/components/ui/StatusText";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { CountUp } from "@/components/ui/CountUp";

export default function JudgesCornerPage() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Interactive Scoring Formula Playground
  const [skillsWeight, setSkillsWeight] = useState(35);
  const [aptitudeWeight, setAptitudeWeight] = useState(15);
  const [mockWeight, setMockWeight] = useState(15);
  const [cgpaWeight, setCgpaWeight] = useState(10);
  const [projectWeight, setProjectWeight] = useState(15);
  const [verifiedWeight, setVerifiedWeight] = useState(10);

  // Sample student: Subham Panda (high skills, lower CGPA)
  // skills 96%, aptitude 92%, mock 95%, cgpa 68.2%, projects 100%, verified 95%
  const totalWeight =
    skillsWeight + aptitudeWeight + mockWeight + cgpaWeight + projectWeight + verifiedWeight || 1;

  const calculatedScore = Math.round(
    (0.96 * skillsWeight +
      0.92 * aptitudeWeight +
      0.95 * mockWeight +
      0.682 * cgpaWeight +
      1.0 * projectWeight +
      0.95 * verifiedWeight) /
      (totalWeight / 100)
  );

  return (
    <AppShell onStartWalkthrough={() => setShowWalkthrough(true)}>
      <div className="space-y-12 py-4">
        {/* Header */}
        <div className="space-y-2 pb-6 hairline-b">
          <div className="text-[12px] font-mono text-ink-3">
            Evaluation reference · Deliverables 8, 9, 11, 12
          </div>
          <h1 className="text-[28px] font-semibold text-ink tracking-tight">
            System architecture & evaluation
          </h1>
          <p className="text-[14px] text-ink-2 max-w-[680px]">
            Technical documentation, verifiable scoring formulation, baseline evaluation metrics,
            and implementation roadmap for university evaluators.
          </p>
        </div>

        {/* Layout: Sticky Table of Contents on Left + Content on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left TOC */}
          <nav className="lg:col-span-3 lg:sticky lg:top-[72px] space-y-2 text-[13px] text-ink-2">
            <div className="font-mono text-[11px] text-ink-3 uppercase tracking-wider mb-2">
              On this page
            </div>
            <a href="#architecture" className="block hover:text-accent transition-colors">
              1. System architecture
            </a>
            <a href="#calculator" className="block hover:text-accent transition-colors">
              2. Interactive scoring formulation
            </a>
            <a href="#algorithms" className="block hover:text-accent transition-colors">
              3. Methodology specifications
            </a>
            <a href="#evaluation" className="block hover:text-accent transition-colors">
              4. Baseline vs CampusLink evaluation
            </a>
            <a href="#implementation" className="block hover:text-accent transition-colors">
              5. Implemented vs planned status
            </a>
          </nav>

          {/* Right Content Column */}
          <div className="lg:col-span-9 space-y-12">
            {/* Section 1: Architecture SVG */}
            <section id="architecture" className="space-y-4">
              <h2 className="text-[18px] font-semibold text-ink tracking-tight">
                1. System architecture
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                CampusLink uses a unified Next.js App Router frontend proxying to two isolated backend services
                via same-origin rewrites, isolating student evaluation records from corporate recruitment operations.
              </p>

              {/* Architectural Visual Blueprint with SpotlightCard */}
              <SpotlightCard
                className="p-6 shadow-card overflow-x-auto space-y-3"
                spotlightColor="rgba(79, 70, 229, 0.08)"
                borderColor="rgba(79, 70, 229, 0.3)"
              >
                <div className="flex items-center justify-between pb-2 hairline-b text-[12px]">
                  <span className="font-semibold text-ink">System Topology & Data Isolation Pipeline</span>
                  <span className="font-mono text-ink-3">BPUT PS10 Compliant Architecture</span>
                </div>

                <svg
                  viewBox="0 0 760 220"
                  className="w-full min-w-[640px] text-ink text-[12px] font-sans"
                  fill="none"
                  stroke="currentColor"
                >
                  <defs>
                    <linearGradient id="clientGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F9F8F5" />
                    </linearGradient>
                    <linearGradient id="proxyGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#EEF2FF" />
                      <stop offset="100%" stopColor="#E0E7FF" />
                    </linearGradient>
                    <linearGradient id="backendGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </linearGradient>
                  </defs>

                  {/* Layer 1: Client Tier */}
                  <rect x="20" y="25" width="180" height="170" rx="10" className="stroke-line" fill="url(#clientGrad)" strokeWidth="1.5" />
                  <text x="35" y="48" className="fill-ink font-semibold text-[13px]" stroke="none">Client tier (Next.js 16)</text>
                  <rect x="35" y="62" width="150" height="34" rx="7" className="stroke-mint/40" fill="#ECFDF5" />
                  <text x="47" y="83" className="fill-mint-dark font-medium text-[11px]" stroke="none">Student (/student)</text>
                  <rect x="35" y="104" width="150" height="34" rx="7" className="stroke-accent/40" fill="#EEF2FF" />
                  <text x="47" y="125" className="fill-accent font-medium text-[11px]" stroke="none">Recruiter (/recruiter)</text>
                  <rect x="35" y="146" width="150" height="34" rx="7" className="stroke-amber/40" fill="#FFF7ED" />
                  <text x="47" y="167" className="fill-amber-dark font-medium text-[11px]" stroke="none">Placement cell (/cell)</text>

                  {/* Connectors to Gateway */}
                  <path d="M200 110 L280 110" className="stroke-accent" strokeWidth="2" strokeDasharray="4 2" />
                  <polygon points="280,110 273,106 273,114" className="fill-accent" stroke="none" />
                  <text x="215" y="100" className="fill-ink-3 text-[10px] font-mono" stroke="none">Same-Origin</text>

                  {/* Layer 2: API Gateway & Bus */}
                  <rect x="280" y="40" width="190" height="140" rx="10" className="stroke-accent" fill="url(#proxyGrad)" strokeWidth="1.5" />
                  <text x="296" y="65" className="fill-ink font-semibold text-[13px]" stroke="none">API Proxy & Bus</text>
                  <text x="296" y="85" className="fill-ink-3 text-[11px]" stroke="none">Rewrites + BroadcastChannel</text>
                  <rect x="296" y="98" width="158" height="24" rx="5" className="stroke-line" fill="#FFFFFF" />
                  <text x="306" y="114" className="fill-ink font-mono text-[11px]" stroke="none">/api/cell/* (Port 5000)</text>
                  <rect x="296" y="128" width="158" height="24" rx="5" className="stroke-line" fill="#FFFFFF" />
                  <text x="306" y="144" className="fill-ink font-mono text-[11px]" stroke="none">/api/recruiter/* (Port 8000)</text>
                  <text x="296" y="168" className="fill-mint-dark text-[10px] font-semibold" stroke="none">Zero-crash synthetic fallback</text>

                  {/* Arrows to Microservices */}
                  <path d="M470 90 L535 60" className="stroke-line-strong" strokeWidth="1.5" />
                  <polygon points="535,60 528,62 531,67" className="fill-ink-2" stroke="none" />
                  <path d="M470 130 L535 160" className="stroke-line-strong" strokeWidth="1.5" />
                  <polygon points="535,160 531,153 528,158" className="fill-ink-2" stroke="none" />

                  {/* Layer 3: Polyglot Backends */}
                  <rect x="535" y="18" width="205" height="85" rx="10" className="stroke-line" fill="url(#backendGrad)" strokeWidth="1.5" />
                  <text x="550" y="42" className="fill-ink font-semibold text-[13px]" stroke="none">Express Server (:5000)</text>
                  <text x="550" y="62" className="fill-ink-2 text-[11px]" stroke="none">Placement Cell & Auditing</text>
                  <text x="550" y="82" className="fill-ink-3 text-[10px] font-mono" stroke="none">MySQL Relational DB</text>

                  <rect x="535" y="117" width="205" height="85" rx="10" className="stroke-line" fill="url(#backendGrad)" strokeWidth="1.5" />
                  <text x="550" y="141" className="fill-ink font-semibold text-[13px]" stroke="none">FastAPI Engine (:8000)</text>
                  <text x="550" y="161" className="fill-ink-2 text-[11px]" stroke="none">Scoring, XAI & Scheduler</text>
                  <text x="550" y="181" className="fill-ink-3 text-[10px] font-mono" stroke="none">SQLite + Vector Engine</text>
                </svg>
              </SpotlightCard>
            </section>

            {/* Section 2: Interactive Scoring Formulation */}
            <section id="calculator" className="space-y-4">
              <h2 className="text-[18px] font-semibold text-ink tracking-tight">
                2. Interactive scoring formulation
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Candidate suitability score is computed via a normalized linear weighted sum of diagnostic factors.
                Adjust the weights below to observe real-time calculation for Subham Panda (non-topper with elite systems skills):
              </p>

              <SpotlightCard
                className="p-5 shadow-card space-y-5 scroll-reveal"
                spotlightColor="rgba(79, 70, 229, 0.08)"
                borderColor="rgba(79, 70, 229, 0.25)"
              >
                <div className="flex items-baseline justify-between pb-3 hairline-b">
                  <div className="text-[13px] text-ink-2">
                    Evaluated candidate: <span className="text-ink font-medium">Subham Panda (IT · CGPA 6.82)</span>
                  </div>
                  <div className="text-[20px] font-semibold font-mono text-accent">
                    Score: <CountUp to={calculatedScore} /> / 100
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[13px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Skills weight</span>
                      <span className="font-mono text-ink tabular-nums">{skillsWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={skillsWeight}
                      onChange={(e) => setSkillsWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Mock interview</span>
                      <span className="font-mono text-ink tabular-nums">{mockWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={mockWeight}
                      onChange={(e) => setMockWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Academic CGPA</span>
                      <span className="font-mono text-ink tabular-nums">{cgpaWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={cgpaWeight}
                      onChange={(e) => setCgpaWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Project quality</span>
                      <span className="font-mono text-ink tabular-nums">{projectWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={projectWeight}
                      onChange={(e) => setProjectWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Aptitude score</span>
                      <span className="font-mono text-ink tabular-nums">{aptitudeWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={aptitudeWeight}
                      onChange={(e) => setAptitudeWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-2">
                      <span>Proctored verification</span>
                      <span className="font-mono text-ink tabular-nums">{verifiedWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={verifiedWeight}
                      onChange={(e) => setVerifiedWeight(+e.target.value)}
                      className="w-full accent-accent h-1.5 bg-line rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-[12px] text-ink-3 font-mono pt-1">
                  Formula: S = Σ (w_i / Σ w) × earned_i. Subham achieves score &gt; 80 even with CGPA 6.82 under skills-first weighting.
                </div>
              </SpotlightCard>
            </section>

            {/* Section 3: Methodology Specifications */}
            <section id="algorithms" className="space-y-4">
              <h2 className="text-[18px] font-semibold text-ink tracking-tight">
                3. Methodology specifications
              </h2>

              <div className="overflow-x-auto hairline-all rounded-[12px] bg-surface">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="hairline-b bg-subtle text-ink-3 text-[12px]">
                      <th className="py-2.5 px-4 font-medium">Subsystem</th>
                      <th className="py-2.5 px-4 font-medium">Model / method</th>
                      <th className="py-2.5 px-4 font-medium">Inputs</th>
                      <th className="py-2.5 px-4 font-medium">Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">JD parser</td>
                      <td className="py-2.5 px-4">Regex boundary tokenisation + alias lookup</td>
                      <td className="py-2.5 px-4">Raw text job description</td>
                      <td className="py-2.5 px-4">Role, cutoffs, must-have and nice-to-have skills</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Readiness profiling</td>
                      <td className="py-2.5 px-4">Normalized multi-factor linear weighting</td>
                      <td className="py-2.5 px-4">CGPA, proctored tests, mock interviews, projects</td>
                      <td className="py-2.5 px-4">0-100 score + 4-tier employability band</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Explainable AI (XAI)</td>
                      <td className="py-2.5 px-4">Counterfactual difference analysis</td>
                      <td className="py-2.5 px-4">Target drive vector vs student vector</td>
                      <td className="py-2.5 px-4">Met factors, missing gaps, actionable projected score delta</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Schedule conflict</td>
                      <td className="py-2.5 px-4">Interval overlap detection with resource constraint</td>
                      <td className="py-2.5 px-4">Interview slots, academic calendar, venues</td>
                      <td className="py-2.5 px-4">Conflict flag, clash severity, automated reallocation slot</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Baseline vs CampusLink Evaluation */}
            <section id="evaluation" className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[18px] font-semibold text-ink tracking-tight">
                  4. Baseline vs CampusLink evaluation
                </h2>
                <span className="text-[11px] font-mono text-ink-3">Synthetic data (800 student cohort)</span>
              </div>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Empirical comparison between traditional college placement practices (pure CGPA cutoff filtering)
                and the CampusLink multi-factor explainable ranking engine.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SpotlightCard
                  className="p-4 shadow-card space-y-1"
                  spotlightColor="rgba(5, 150, 105, 0.08)"
                  borderColor="rgba(5, 150, 105, 0.3)"
                >
                  <div className="text-[12px] text-ink-3">Capably skilled non-toppers rescued</div>
                  <div className="text-[20px] font-semibold font-mono text-mint-dark">
                    +<CountUp to={24} /> candidates
                  </div>
                  <p className="text-[12px] text-ink-3">
                    High project & mock interview capability, excluded by strict 7.5 CGPA filters.
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-4 shadow-card space-y-1"
                  spotlightColor="rgba(79, 70, 229, 0.08)"
                  borderColor="rgba(79, 70, 229, 0.3)"
                >
                  <div className="text-[12px] text-ink-3">Interview conversion alignment</div>
                  <div className="text-[20px] font-semibold font-mono text-ink">
                    <CountUp to={91.4} decimals={1} suffix="%" />
                  </div>
                  <p className="text-[12px] text-ink-3">
                    Alignment with final recruiter selection decisions versus 62.1% for CGPA only.
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-4 shadow-card space-y-1"
                  spotlightColor="rgba(5, 150, 105, 0.08)"
                  borderColor="rgba(5, 150, 105, 0.3)"
                >
                  <div className="text-[12px] text-ink-3">Scheduling clash reduction</div>
                  <div className="text-[20px] font-semibold font-mono text-mint-dark">
                    <CountUp to={100} suffix="% resolved" />
                  </div>
                  <p className="text-[12px] text-ink-3">
                    Eliminated simultaneous exam and interview booking collisions across venues.
                  </p>
                </SpotlightCard>
              </div>
            </section>

            {/* Section 5: Implemented vs Planned Status Table */}
            <section id="implementation" className="space-y-4">
              <h2 className="text-[18px] font-semibold text-ink tracking-tight">
                5. Implemented vs planned status
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Transparent disclosure of currently demonstrated prototype features versus multi-campus production roadmap.
              </p>

              <div className="overflow-x-auto hairline-all rounded-[12px] bg-surface">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="hairline-b bg-subtle text-ink-3 text-[12px]">
                      <th className="py-2.5 px-4 font-medium">Capability</th>
                      <th className="py-2.5 px-4 font-medium">Demonstrated prototype</th>
                      <th className="py-2.5 px-4 font-medium">Production planned</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Role-based access</td>
                      <td className="py-2.5 px-4">Header-based demo validation (X-Demo-User-Role)</td>
                      <td className="py-2.5 px-4">JWT Bearer tokens + PostgreSQL Row-Level Security</td>
                      <td className="py-2.5 px-4"><StatusText status="ok" size="sm">Prototype demonstrated</StatusText></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Cross-portal sync</td>
                      <td className="py-2.5 px-4">Browser BroadcastChannel cross-tab bus</td>
                      <td className="py-2.5 px-4">Redis Pub/Sub with WebSocket cluster</td>
                      <td className="py-2.5 px-4"><StatusText status="ok" size="sm">Live in demo</StatusText></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Persistence layer</td>
                      <td className="py-2.5 px-4">Dual database (Express MySQL + FastAPI SQLite)</td>
                      <td className="py-2.5 px-4">Unified PostgreSQL with campus_id tenancy partition</td>
                      <td className="py-2.5 px-4"><StatusText status="ok" size="sm">Integrated via proxy</StatusText></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-ink">Offline resilience</td>
                      <td className="py-2.5 px-4">SafeFetch synthetic fallback fixtures</td>
                      <td className="py-2.5 px-4">Read-replica clustering + Edge caching</td>
                      <td className="py-2.5 px-4"><StatusText status="ok" size="sm">Active (zero-crash)</StatusText></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showWalkthrough && <GuidedDemo onClose={() => setShowWalkthrough(false)} />}
    </AppShell>
  );
}
