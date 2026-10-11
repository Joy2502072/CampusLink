"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { eventBus } from "@/lib/bus";

interface Candidate {
  id: string;
  n: string;
  m: string;
  cgpa: number;
  miss: string[];
  r: {
    skills: number;
    apt: number;
    mock: number;
    cgpa: number;
    proj: number;
    ver: number;
  };
}

const F6 = [
  { k: "skills", l: "Skills", w: 35, s: "s" },
  { k: "apt", l: "Aptitude", w: 15, s: "g" },
  { k: "mock", l: "Mock interview", w: 15, s: "m" },
  { k: "cgpa", l: "CGPA", w: 10, s: "g" },
  { k: "proj", l: "Projects", w: 15, s: "s" },
  { k: "ver", l: "Verified skills", w: 10, s: "s" },
];

const CANDIDATES_DATA: Candidate[] = [
  {
    id: "ananya",
    n: "Ananya Mohanty",
    m: "CSE",
    cgpa: 8.85,
    miss: ["Docker"],
    r: { skills: 0.86, apt: 0.88, mock: 0.85, cgpa: 0.885, proj: 0.83, ver: 0.82 },
  },
  {
    id: "debasis",
    n: "Debasis Rout",
    m: "CSE",
    cgpa: 8.9,
    miss: ["Kubernetes"],
    r: { skills: 0.78, apt: 0.9, mock: 0.8, cgpa: 0.89, proj: 0.72, ver: 0.75 },
  },
  {
    id: "subham",
    n: "Subham Panda",
    m: "CSE",
    cgpa: 6.82,
    miss: [],
    r: { skills: 0.93, apt: 0.55, mock: 0.88, cgpa: 0.682, proj: 0.9, ver: 0.85 },
  },
  {
    id: "rahul",
    n: "Rahul Das",
    m: "CSE",
    cgpa: 8.0,
    miss: ["Kubernetes"],
    r: { skills: 0.8, apt: 0.78, mock: 0.7, cgpa: 0.8, proj: 0.75, ver: 0.72 },
  },
  {
    id: "priya",
    n: "Priya Sharma",
    m: "ECE",
    cgpa: 8.45,
    miss: ["Docker", "AWS"],
    r: { skills: 0.7, apt: 0.7333, mock: 0.7667, cgpa: 0.845, proj: 0.6333, ver: 0.705 },
  },
  {
    id: "meera",
    n: "Meera Nayak",
    m: "IT",
    cgpa: 7.9,
    miss: ["Docker", "Kubernetes", "AWS"],
    r: { skills: 0.64, apt: 0.72, mock: 0.75, cgpa: 0.79, proj: 0.6, ver: 0.55 },
  },
];

const CUT = 7.5;
const COL = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export default function RecruiterMatchingPage() {
  const [sliderVal, setSliderVal] = useState(50);
  const [flexCutoff, setFlexCutoff] = useState(true);
  const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [flashing, setFlashing] = useState<Record<string, boolean>>({});

  // Offer risk state
  const [scA, setScA] = useState(false); // Competing offer
  const [scB, setScB] = useState(true); // Package above expectation
  const [gaugeVal, setGaugeVal] = useState(74);

  // Compute weights from slider
  const t = sliderVal / 100;
  const ms = 0.5 + t;
  const mg = 1.5 - t;
  const rawWeights = F6.map((f) => f.w * (f.s === "s" ? ms : f.s === "g" ? mg : 1));
  const sumWeights = rawWeights.reduce((a, b) => a + b, 0);
  const W = rawWeights.map((x) => (x / sumWeights) * 100);

  // Score each candidate
  const scoredCandidates = CANDIDATES_DATA.map((c) => {
    let f = 0;
    F6.forEach((x, i) => {
      f += W[i] * c.r[x.k as keyof typeof c.r];
    });
    const below = c.cgpa < CUT;
    const vis = !below || (flexCutoff && f >= 70);
    return { c, f, below, vis };
  })
    .filter((x) => x.vis)
    .sort((a, b) => b.f - a.f);

  // Detect rank deltas
  useEffect(() => {
    const nextRanks: Record<string, number> = {};
    const newFlashing: Record<string, boolean> = {};

    scoredCandidates.forEach((item, idx) => {
      const rank = idx + 1;
      nextRanks[item.c.id] = rank;
      if (prevRanks[item.c.id] !== undefined && prevRanks[item.c.id] !== rank) {
        newFlashing[item.c.id] = true;
      }
    });

    setFlashing(newFlashing);
    setPrevRanks(nextRanks);

    const timer = setTimeout(() => {
      setFlashing({});
    }, 700);
    return () => clearTimeout(timer);
  }, [sliderVal, flexCutoff]);

  // Recalculate gauge
  useEffect(() => {
    let p = 74;
    if (scA) p -= 22;
    if (!scB) p -= 8;
    setGaugeVal(Math.max(5, Math.min(98, p)));
  }, [scA, scB]);

  const toggleShortlist = (c: Candidate) => {
    const next = !shortlisted[c.id];
    setShortlisted((prev) => ({ ...prev, [c.id]: next }));
    if (next) {
      eventBus.publish({
        type: "CANDIDATE_SHORTLISTED",
        title: "Candidate shortlisted",
        data: { candidateName: c.n, company: "Apex Cloud" },
      });
    }
  };

  return (
    <AppShell>
      <div className="space-y-10" id="s-match">
        {/* Sub-Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Recruiter portal · Apex Cloud Technologies
            </div>
            <h1 className="text-[18px] font-semibold text-ink tracking-tight mt-0.5">
              Candidate Matching & Hidden Gem Discovery
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/recruiter"
              className="px-3.5 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              Candidate ranking
            </Link>
            <Link
              href="/recruiter/drives/new"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              JD studio
            </Link>
            <Link
              href="/recruiter/pipeline"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Pipeline
            </Link>
          </div>
        </div>

        {/* ===================== 05 CANDIDATE RANKING SECTION ===================== */}
        <section className="space-y-3">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">05</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Candidate ranking
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Drag the slider: rows glide to their new rank. Turn the flexible cutoff policy off to eliminate Subham Panda;
            turn it on to allow him back in. "Why" opens the weighted contribution breakdown.
          </p>

          <div className="card" id="candCard">
            {/* Steering Controls */}
            <div className="cand-ctl grid gap-3 pb-2 border-b border-line">
              <div className="slider-row flex items-center gap-3 text-[14px] text-ink-2">
                <span className="font-medium text-ink">Grades</span>
                <input
                  id="mix"
                  type="range"
                  min="0"
                  max="100"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
                  className="flex-1 accent-primary min-w-[140px] cursor-pointer"
                  aria-label="Weight between grades and skills"
                />
                <span className="font-medium text-ink">Skills</span>
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="flex"
                    checked={flexCutoff}
                    onChange={(e) => setFlexCutoff(e.target.checked)}
                  />
                  <span className="sw-track">
                    <i />
                  </span>
                  <span className="text-[13px] text-ink font-medium">
                    Flexible cutoff (allow below 7.5 CGPA)
                  </span>
                </label>

                <p className="tiny mono text-ink-3 text-[12px]">
                  Skills side x{(0.5 + t).toFixed(2)} · Academic side x{(1.5 - t).toFixed(2)} · Interview x1.00
                </p>
              </div>
            </div>

            {/* Candidate List */}
            <ul className="cands grid gap-2.5 mt-4" id="cands">
              {scoredCandidates.map((item, idx) => {
                const rank = idx + 1;
                const prev = prevRanks[item.c.id];
                const delta = prev !== undefined ? prev - rank : 0;
                const isGem = item.below && item.f >= 75;
                const isOpen = !!openWhy[item.c.id];
                const isShortlisted = !!shortlisted[item.c.id];
                const isFlashing = !!flashing[item.c.id];
                const initials = item.c.n.split(" ").map((x) => x[0]).join("");

                return (
                  <li
                    key={item.c.id}
                    className={`cand ${isFlashing ? "flash" : ""} ${isOpen ? "open" : ""}`}
                  >
                    {/* Rank & Delta */}
                    <div className="c-rank text-center">
                      <span className="mono rk text-[17px] font-semibold text-ink">
                        {rank}
                      </span>
                      {delta !== 0 && (
                        <span
                          className={`mono dl text-[11px] font-semibold ${
                            delta > 0 ? "text-mint-ink" : "text-coral-ink"
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </div>

                    {/* Candidate Identity */}
                    <div className="c-id flex items-center gap-3 min-w-0">
                      <span className="av w-[38px] h-[38px] rounded-full bg-primary-soft text-primary font-semibold text-[13px] grid place-items-center shrink-0">
                        {initials}
                      </span>
                      <div className="c-nm min-w-0">
                        <b className="font-semibold text-ink text-[14px] truncate block">
                          {item.c.n}
                        </b>
                        <span className="c-meta text-[12px] text-ink-3">
                          {item.c.m} · CGPA {item.c.cgpa.toFixed(2)}
                        </span>
                        <div className="c-tags flex gap-1.5 flex-wrap mt-1">
                          {item.below && (
                            <span className="chip warn">Below cutoff</span>
                          )}
                          {isGem && (
                            <span className="chip pri gemchip sweep">
                              Hidden gem
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Bar */}
                    <div className="c-fit grid gap-1.5">
                      <span className="mono fv text-[18px] font-semibold text-ink leading-none">
                        {item.f.toFixed(1)}%
                      </span>
                      <span className="bar h-1 rounded-full bg-surface-3 overflow-hidden">
                        <i
                          className="block h-full bg-primary rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${item.f}%` }}
                        />
                      </span>
                    </div>

                    {/* Skills Breakdown */}
                    <div className="c-sk text-[13px] text-ink-2 flex items-center gap-2 flex-wrap">
                      <span className="mono font-semibold text-ink">
                        {6 - item.c.miss.length}/6
                      </span>
                      <span>skills</span>
                      {item.c.miss.length > 0 && (
                        <span className="chip bad text-[11px]">
                          {item.c.miss[0]}
                          {item.c.miss.length > 1 ? ` +${item.c.miss.length - 1}` : ""}
                        </span>
                      )}
                    </div>

                    {/* Actions: Why & Shortlist */}
                    <div className="c-act flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenWhy((prev) => ({
                            ...prev,
                            [item.c.id]: !prev[item.c.id],
                          }))
                        }
                        className="btn btn-ghost sm"
                        aria-expanded={isOpen}
                      >
                        Why
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleShortlist(item.c)}
                        className={`btn btn-primary sm sl ${
                          isShortlisted ? "bg-mint-ink text-on-primary" : ""
                        }`}
                        aria-pressed={isShortlisted}
                      >
                        {isShortlisted ? (
                          <>
                            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-none stroke-current stroke-3">
                              <polyline points="4 10 8 14 16 6" />
                            </svg>
                            Shortlisted
                          </>
                        ) : (
                          "Shortlist"
                        )}
                      </button>
                    </div>

                    {/* Expandable "Why" Diagnostic Drawer */}
                    <div className="why">
                      <div className="why-in">
                        <div className="mini flex gap-1 h-3 rounded-full overflow-hidden my-2.5 bg-surface-2">
                          {F6.map((x, i) => {
                            const val = W[i] * item.c.r[x.k as keyof typeof item.c.r];
                            return (
                              <span
                                key={x.k}
                                style={{
                                  flex: String(Math.max(val, 0.01)),
                                  background: COL[i],
                                }}
                                title={`${x.l}: ${val.toFixed(1)} points`}
                              />
                            );
                          })}
                        </div>
                        <p className="why-t text-[13px] text-ink-2 pb-1">
                          Strongest: Projects & Practical Skills.
                          {item.below &&
                            ` Candidate holds a ${item.c.cgpa.toFixed(2)} CGPA, but qualifies via flexible multi-factor evaluation.`}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ===================== 07 OFFER RISK GAUGE SECTION ===================== */}
        <section className="space-y-3" id="s-gauge">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">07</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Offer risk gauge
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Recruiter-side acceptance probability predictor. The needle swings with a spring easing curve and the arc fills with the simulated value.
          </p>

          <div className="card g-wrap" id="gaugeCard">
            {/* 200x120 SVG Semicircle Gauge */}
            <div className="gauge relative w-[260px] max-w-full mx-auto sm:mx-0">
              <svg viewBox="0 0 200 120" role="img" aria-label="Offer acceptance likelihood gauge">
                <defs>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--coral)" />
                    <stop offset="50%" stopColor="var(--amber)" />
                    <stop offset="100%" stopColor="var(--mint)" />
                  </linearGradient>
                </defs>

                {/* Track */}
                <path
                  className="g-arc g-track fill-none stroke-[14] stroke-surface-3"
                  pathLength="100"
                  d="M 20 100 A 80 80 0 0 1 180 100"
                />

                {/* Animated Gradient Progress */}
                <path
                  className="g-arc g-prog fill-none stroke-[14] transition-all duration-1000 ease-out"
                  stroke="url(#gGrad)"
                  pathLength="100"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: `${gaugeVal} 100`,
                  }}
                  d="M 20 100 A 80 80 0 0 1 180 100"
                />

                {/* Rotating Spring Needle */}
                <g
                  className="needle"
                  id="needle"
                  style={{
                    transform: `rotate(${-90 + gaugeVal * 1.8}deg)`,
                  }}
                >
                  <line x1="100" y1="100" x2="100" y2="38" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="7" fill="var(--ink)" />
                </g>
              </svg>

              <div className="g-num text-center mt-[-6px]">
                <b className="mono text-[34px] font-bold text-ink">{gaugeVal}%</b>
              </div>
            </div>

            {/* Scenario Factors & Follow-up Button */}
            <div>
              <p className="who text-[13px] text-ink-2 mb-1">
                Apex Cloud · Cloud Engineer · Subham Panda
              </p>
              <span
                className={`chip ${
                  gaugeVal >= 70 ? "ok" : gaugeVal >= 45 ? "warn" : "bad"
                }`}
              >
                {gaugeVal >= 70 ? "Low risk" : gaugeVal >= 45 ? "Medium risk" : "High risk"}
              </span>

              <div className="g-factors flex gap-2 flex-wrap my-3">
                <span className="chip ok">+ Strong interview score</span>
                {scB ? (
                  <span className="chip ok">+ Package above expectation</span>
                ) : (
                  <span className="chip bad">- Package at expectation</span>
                )}
                {scA ? (
                  <span className="chip bad">- Competing offer</span>
                ) : (
                  <span className="chip">No competing offers</span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <label className="switch block">
                  <input
                    type="checkbox"
                    checked={scA}
                    onChange={(e) => setScA(e.target.checked)}
                  />
                  <span className="sw-track">
                    <i />
                  </span>
                  <span className="text-[13px] text-ink">Competing offer from another firm</span>
                </label>

                <label className="switch block">
                  <input
                    type="checkbox"
                    checked={scB}
                    onChange={(e) => setScB(e.target.checked)}
                  />
                  <span className="sw-track">
                    <i />
                  </span>
                  <span className="text-[13px] text-ink">Package above stated candidate threshold</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  eventBus.publish({
                    type: "OFFER_FOLLOWUP",
                    title: "Follow-up sent",
                    data: { candidate: "Subham Panda", acceptance: `${gaugeVal}%` },
                  });
                }}
                className="btn btn-primary sm"
              >
                Send offer follow-up
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
