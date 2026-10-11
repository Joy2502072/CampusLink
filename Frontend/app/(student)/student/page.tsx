"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";

interface Factor {
  k: string;
  l: string;
  max: number;
  e: number;
}

export default function StudentReadinessPage() {
  // Shared single source of truth for factor scores
  const FACTORS: Factor[] = [
    { k: "skills", l: "Skills", max: 35, e: 24.5 },
    { k: "apt", l: "Aptitude", max: 15, e: 11 },
    { k: "mock", l: "Mock interview", max: 15, e: 11.5 },
    { k: "cgpa", l: "CGPA", max: 10, e: 8.45 },
    { k: "proj", l: "Projects", max: 15, e: 9.5 },
    { k: "ver", l: "Verified skills", max: 10, e: 7.05 },
  ];

  const BASE = 72; // Sum of factor values: 24.5 + 11 + 11.5 + 8.45 + 9.5 + 7.05 = 72.0
  const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  // What-if simulator checklist
  const [checkedItems, setCheckedItems] = useState({
    docker: false,
    aws: false,
    sysdesign: false,
  });

  const [displayScore, setDisplayScore] = useState(BASE);
  const [hoveredFactor, setHoveredFactor] = useState<number | null>(null);

  // Compute target score
  const bonus =
    (checkedItems.docker ? 6.7 : 0) +
    (checkedItems.aws ? 5.4 : 0) +
    (checkedItems.sysdesign ? 4.2 : 0);
  const targetScore = Math.min(100, Math.round((BASE + bonus) * 100) / 100);

  // Eased score ticker
  useEffect(() => {
    let start = displayScore;
    const end = targetScore;
    if (start === end) return;

    const duration = 750;
    const startTime = performance.now();

    const frame = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(start + (end - start) * ease));
      if (p < 1) requestAnimationFrame(frame);
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [targetScore]);

  // SVG Ring: R=74, CI = 2 * PI * 74 ≈ 464.95
  const R = 74;
  const CI = 2 * Math.PI * R;
  const strokeOffset = CI * (1 - targetScore / 100);
  const N_TICKS = 60;
  const litTicks = Math.round((targetScore / 100) * N_TICKS);

  // Band calculations
  const getBandIndex = (s: number) => {
    if (s >= 80) return 3;
    if (s >= 65) return 2;
    if (s >= 40) return 1;
    return 0;
  };

  const BANDS = [
    { label: "Not ready", chipClass: "chip bad" },
    { label: "Developing", chipClass: "chip warn" },
    { label: "Ready", chipClass: "chip pri" },
    { label: "Highly employable", chipClass: "chip ok" },
  ];

  const currentBandIdx = getBandIndex(targetScore);
  const currentBand = BANDS[currentBandIdx];

  const toggleCheck = (key: "docker" | "aws" | "sysdesign") => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppShell>
      <div className="space-y-8" id="s-ring">
        {/* Sub-Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Student portal · Roll 2505064
            </div>
            <h1 className="text-[18px] font-semibold text-ink tracking-tight mt-0.5">
              Ananya Mohanty · CSE Class of 2027 · GEC
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/student"
              className="px-3.5 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              Readiness profile
            </Link>
            <Link
              href="/student/jobs"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Drives & offers
            </Link>
          </div>
        </div>

        {/* ===================== 02 READINESS RING & WHAT-IF ===================== */}
        <section className="space-y-3">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">02</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Readiness ring
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Gradient ring with 60 illuminated ticks, a four-step band ladder (Not ready to Highly employable),
            and a what-if checklist. The score matches the sum of the factor values below.
          </p>

          <div className="card ringcard" id="ringCard">
            {/* 200x200 SVG Ring */}
            <div className="ring-wrap relative w-[220px] h-[220px] shrink-0 mx-auto sm:mx-0">
              <svg
                className="ring w-[220px] h-[220px]"
                viewBox="0 0 200 200"
                role="img"
                aria-label="Readiness score ring"
              >
                <defs>
                  <linearGradient id="gRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--mint)" />
                  </linearGradient>
                </defs>

                {/* 60 Circular Ticks */}
                <g id="ticks">
                  {Array.from({ length: N_TICKS }).map((_, i) => {
                    const a = (i / N_TICKS) * 2 * Math.PI - Math.PI / 2;
                    const x1 = (100 + Math.cos(a) * 89).toFixed(2);
                    const y1 = (100 + Math.sin(a) * 89).toFixed(2);
                    const x2 = (100 + Math.cos(a) * 96).toFixed(2);
                    const y2 = (100 + Math.sin(a) * 96).toFixed(2);
                    const isLit = i < litTicks;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={`tick ${isLit ? "on" : ""}`}
                      />
                    );
                  })}
                </g>

                {/* Background Track */}
                <circle className="ring-track" cx="100" cy="100" r={R} />

                {/* Animated Gradient Bar */}
                <circle
                  className="ring-bar"
                  id="ringBar"
                  cx="100"
                  cy="100"
                  r={R}
                  transform="rotate(-90 100 100)"
                  style={{
                    strokeDasharray: CI,
                    strokeDashoffset: strokeOffset,
                  }}
                />
              </svg>

              <div className="ring-center absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="mono ring-num text-[52px] font-bold leading-none text-ink tabular-nums">
                  {displayScore}
                </span>
                <span className="ring-sub text-[12px] text-ink-3 mt-1">of 100</span>
              </div>
            </div>

            {/* Profile Info, Ladder & Simulator */}
            <div className="w-full">
              <p className="who text-[13px] text-ink-2 mb-1">
                Ananya Mohanty · CSE · CGPA 8.85
              </p>
              <span className={currentBand.chipClass}>{currentBand.label}</span>

              {/* Four-step Band Ladder */}
              <ol className="ladder" id="ladder" aria-label="Readiness bands">
                {BANDS.map((b, idx) => (
                  <li
                    key={b.label}
                    className={`${idx <= currentBandIdx ? "reached" : ""} ${
                      idx === currentBandIdx ? "active" : ""
                    }`}
                  >
                    {b.label}
                  </li>
                ))}
              </ol>

              {/* What-if Simulator Checklist */}
              <div className="lvl-list grid gap-2">
                <label className="lvl">
                  <input
                    type="checkbox"
                    checked={checkedItems.docker}
                    onChange={() => toggleCheck("docker")}
                  />
                  <span className="cb">
                    <svg viewBox="0 0 20 20">
                      <polyline points="4 10 8 14 16 6" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-ink">Docker lab</span>
                  <span className="pts mono ml-auto text-[12px] px-2 py-0.5 rounded-full bg-mint-soft text-mint-ink font-medium">
                    +6.7
                  </span>
                </label>

                <label className="lvl">
                  <input
                    type="checkbox"
                    checked={checkedItems.aws}
                    onChange={() => toggleCheck("aws")}
                  />
                  <span className="cb">
                    <svg viewBox="0 0 20 20">
                      <polyline points="4 10 8 14 16 6" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-ink">AWS certificate</span>
                  <span className="pts mono ml-auto text-[12px] px-2 py-0.5 rounded-full bg-mint-soft text-mint-ink font-medium">
                    +5.4
                  </span>
                </label>

                <label className="lvl">
                  <input
                    type="checkbox"
                    checked={checkedItems.sysdesign}
                    onChange={() => toggleCheck("sysdesign")}
                  />
                  <span className="cb">
                    <svg viewBox="0 0 20 20">
                      <polyline points="4 10 8 14 16 6" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-ink">System design mock</span>
                  <span className="pts mono ml-auto text-[12px] px-2 py-0.5 rounded-full bg-mint-soft text-mint-ink font-medium">
                    +4.2
                  </span>
                </label>
              </div>

              <p className="tiny text-ink-3 text-[12px] mt-2.5">
                Simulated what-if scores calculate instant readiness boosts without saving until confirmed.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== 03 EXPLAINABILITY STACKED BAR ===================== */}
        <section className="space-y-3" id="s-stack">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">03</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Explainability bar
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            One stacked bar shows where every point came from. Hover or focus any segment or legend row to isolate it.
            The hatched segment is the remaining gap to 100.
          </p>

          <div className="card">
            <div className="total flex items-baseline justify-between mb-3">
              <span className="mono text-[28px] font-bold text-ink">
                {BASE}
              </span>
              <span className="tiny text-ink-3 text-[12px]">points earned of 100</span>
            </div>

            {/* Stacked Horizontal Bar */}
            <div className={`stack ${hoveredFactor !== null ? "hl" : ""}`} role="group" aria-label="Score contributions">
              {FACTORS.map((f, i) => (
                <button
                  key={f.k}
                  type="button"
                  onMouseEnter={() => setHoveredFactor(i)}
                  onMouseLeave={() => setHoveredFactor(null)}
                  onFocus={() => setHoveredFactor(i)}
                  onBlur={() => setHoveredFactor(null)}
                  className={`seg ${hoveredFactor === i ? "on" : ""}`}
                  style={{
                    width: `${f.e}%`,
                    background: CHART_COLORS[i],
                    transitionDelay: `${i * 70}ms`,
                  }}
                  aria-label={`${f.l}: ${f.e} of ${f.max} points`}
                />
              ))}

              {/* Hatched Gap to 100 */}
              <span
                className="seg gap"
                style={{ width: `${100 - BASE}%` }}
                aria-label={`Gap to 100: ${100 - BASE} points`}
              />
            </div>

            {/* Interactive Legend List */}
            <ul className="legend grid gap-1 mt-3.5">
              {FACTORS.map((f, i) => (
                <li
                  key={f.k}
                  onMouseEnter={() => setHoveredFactor(i)}
                  onMouseLeave={() => setHoveredFactor(null)}
                  className={`lg ${hoveredFactor === i ? "on" : ""}`}
                >
                  <span
                    className="lg-sw"
                    style={{ background: CHART_COLORS[i] }}
                  />
                  <span className="text-[13px] font-medium text-ink">{f.l}</span>
                  <span className="lg-bar">
                    <i
                      style={{
                        width: `${(f.e / f.max) * 100}%`,
                        background: CHART_COLORS[i],
                      }}
                    />
                  </span>
                  <span className="mono lg-v text-[13px] text-ink-2">
                    {f.e} / {f.max}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
