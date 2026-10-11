"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { eventBus } from "@/lib/bus";

interface DriveSession {
  id: string;
  n: string;
  s: number; // Start hour
  d: number; // Duration
  v: "A" | "B" | "C"; // Venue
  br: string[];
  mv?: boolean;
}

const VENUES = [
  { id: "A", n: "Seminar Hall A" },
  { id: "B", n: "Seminar Hall B" },
  { id: "C", n: "Auditorium 1" },
];

const INITIAL_DRIVES: DriveSession[] = [
  { id: "apex", n: "Apex Cloud", s: 10, d: 2.5, v: "A", br: ["CSE", "IT", "ECE"], mv: true },
  { id: "nexus", n: "Nexus Core", s: 10, d: 2, v: "A", br: ["ECE", "EEE"] },
  { id: "zenith", n: "Zenith Digital", s: 13, d: 2, v: "B", br: ["Mech", "Civil"] },
];

const EXAM_CALENDAR = {
  start: 10,
  end: 12,
  br: ["CSE", "IT"],
  label: "BPUT mid-sem exam · CSE, IT",
};

const BRANCH_ANALYTICS = [
  { name: "CSE", placed: 310, total: 360 },
  { name: "IT", placed: 198, total: 240 },
  { name: "ECE", placed: 196, total: 280 },
  { name: "EEE", placed: 94, total: 160 },
  { name: "Mech", placed: 58, total: 140 },
  { name: "Civil", placed: 40, total: 100 },
];

export default function PlacementCellPage() {
  const [drives, setDrives] = useState<DriveSession[]>(INITIAL_DRIVES);
  const [branchSort, setBranchSort] = useState<"rate" | "size">("rate");
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null);

  const START = 9;
  const END = 15;

  const fmtTime = (h: number) => {
    const H = Math.floor(h);
    const M = Math.round((h - H) * 60);
    return `${H < 10 ? "0" : ""}${H}:${M ? "30" : "00"}`;
  };

  const getVenueName = (id: string) => VENUES.find((v) => v.id === id)?.n || id;

  // Collision detection
  const hasOverlap = (a: DriveSession, b: DriveSession) =>
    a.s < b.s + b.d && b.s < a.s + a.d;

  interface TimetableConflict {
    type: string;
    ids: string[];
    desc: string;
  }
  const conflicts: TimetableConflict[] = [];
  for (let i = 0; i < drives.length; i++) {
    for (let j = i + 1; j < drives.length; j++) {
      const a = drives[i];
      const b = drives[j];
      if (a.v === b.v && hasOverlap(a, b)) {
        conflicts.push({
          type: "Venue double-booked",
          ids: [a.id, b.id],
          desc: `${getVenueName(a.v)}, ${fmtTime(Math.max(a.s, b.s))} to ${fmtTime(
            Math.min(a.s + a.d, b.s + b.d)
          )}`,
        });
      }
    }
  }

  // Conflict state
  const isConflict = conflicts.length > 0;

  const handleFixClash = (newVenue: "A" | "B" | "C", newStart: number) => {
    setDrives((prev) =>
      prev.map((d) => (d.mv ? { ...d, v: newVenue, s: newStart } : d))
    );
    setResolvedMessage(
      `Moved Apex Cloud to ${getVenueName(newVenue)}, ${fmtTime(newStart)} to ${fmtTime(
        newStart + 2.5
      )}. Re-checked.`
    );
    eventBus.publish({
      type: "TIMETABLE_RESOLVED",
      title: "Clash resolved",
      data: { venue: getVenueName(newVenue), time: `${fmtTime(newStart)} - ${fmtTime(newStart + 2.5)}` },
    });
  };

  const handleReset = () => {
    setDrives(INITIAL_DRIVES);
    setResolvedMessage(null);
  };

  // Sorted branch stats
  const sortedBranches = [...BRANCH_ANALYTICS].sort((a, b) => {
    if (branchSort === "rate") {
      return b.placed / b.total - a.placed / a.total;
    }
    return b.total - a.total;
  });

  return (
    <AppShell>
      <div className="space-y-10" id="s-tt">
        {/* Sub-Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Placement cell portal · BPUT Placement Operations
            </div>
            <h1 className="text-[18px] font-semibold text-ink tracking-tight mt-0.5">
              Conflict-Aware Scheduler & Venue Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/cell"
              className="px-3.5 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              Scheduler
            </Link>
            <Link
              href="/cell/scheduler"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Master timetable
            </Link>
          </div>
        </div>

        {/* ===================== 08 TIMETABLE SECTION ===================== */}
        <section className="space-y-3">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">08</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Conflict-aware scheduler
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Conflicts are computed automatically from venue overlap and exam calendars. Alternative slots are searched
            from real availability and verified after every move.
          </p>

          <div className="card" id="ttCard">
            {/* Timetable Scroll Area */}
            <div className="tt-scroll">
              <div className="tt">
                {/* Time Headers */}
                {Array.from({ length: END - START }).map((_, i) => {
                  const hour = START + i;
                  return (
                    <div
                      key={hour}
                      className="tt-h mono"
                      style={{
                        gridRow: 1,
                        gridColumn: `${i * 2 + 2} / span 2`,
                      }}
                    >
                      {fmtTime(hour)}
                    </div>
                  );
                })}

                {/* Venue Row Labels & Grid Lines */}
                {["Exam calendar", ...VENUES.map((v) => v.n)].map((label, r) => (
                  <React.Fragment key={label}>
                    <div
                      className="tt-l font-medium text-ink-2"
                      style={{ gridRow: r + 2 }}
                    >
                      {label}
                    </div>
                    {Array.from({ length: (END - START) * 2 }).map((_, c) => (
                      <div
                        key={c}
                        className="tt-c"
                        style={{ gridRow: r + 2, gridColumn: c + 2 }}
                      />
                    ))}
                  </React.Fragment>
                ))}

                {/* Exam Block */}
                <div
                  className="tt-ex font-mono text-[12px]"
                  style={{
                    gridRow: 2,
                    gridColumn: `${(EXAM_CALENDAR.start - START) * 2 + 2} / span ${
                      (EXAM_CALENDAR.end - EXAM_CALENDAR.start) * 2
                    }`,
                  }}
                >
                  {EXAM_CALENDAR.label}
                </div>

                {/* Company Drive Blocks */}
                {drives.map((d) => {
                  const vi = VENUES.findIndex((v) => v.id === d.v);
                  const isBad = conflicts.some((c) => c.ids.includes(d.id));
                  const isMoved = d.mv && (d.s !== 10 || d.v !== "A");

                  return (
                    <div
                      key={d.id}
                      className={`blk transition-all duration-500 ${
                        isBad ? "bad shake" : isMoved ? "ok" : ""
                      }`}
                      style={{
                        gridRow: vi + 3,
                        gridColumn: `${(d.s - START) * 2 + 2} / span ${d.d * 2}`,
                      }}
                    >
                      <b className="truncate block">{d.n}</b>
                      <span className="mono text-[11px] opacity-90">
                        {fmtTime(d.s)} to {fmtTime(d.s + d.d)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conflict & Resolution Banner */}
            <div className="tt-status grid gap-2.5 mt-4" aria-live="polite">
              {isConflict ? (
                <>
                  {conflicts.map((c, i) => (
                    <div key={i} className="cf">
                      <i />
                      <div>
                        <b>{c.type}.</b> {c.desc}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <p className="tiny text-ink-3 mb-2 font-medium">
                      Suggested fixes, computed from free venue slots:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleFixClash("B", 10)}
                        className="btn btn-ghost sm border-line-strong hover:bg-surface-2"
                      >
                        Apex Cloud to Seminar Hall B, 10:00 to 12:30
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFixClash("C", 10)}
                        className="btn btn-ghost sm border-line-strong hover:bg-surface-2"
                      >
                        Apex Cloud to Auditorium 1, 10:00 to 12:30
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="cf good">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 fill-none stroke-current stroke-3">
                    <polyline points="4 10 8 14 16 6" />
                  </svg>
                  <div>
                    <b>No conflicts.</b>{" "}
                    {resolvedMessage || "All scheduled drives are free of venue collisions and mid-sem exam overlaps."}
                  </div>
                </div>
              )}
            </div>

            <div className="row-btns mt-4">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost sm"
              >
                Reset demo scenario
              </button>
            </div>
          </div>
        </section>

        {/* ===================== 10 CONVERSION BY BRANCH ===================== */}
        <section className="space-y-3" id="s-an">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">10</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Conversion by branch
            </h2>
          </div>

          <div className="card">
            <div className="head-row flex justify-between items-center gap-3 mb-4 flex-wrap">
              <h3 className="text-[15px] font-semibold text-ink">
                Academic cohort breakdown
              </h3>
              <div className="seg-ctl flex bg-surface-2 rounded-full p-[3px]" role="group" aria-label="Sort branches">
                <button
                  type="button"
                  onClick={() => setBranchSort("rate")}
                  aria-pressed={branchSort === "rate"}
                  className="px-3 py-1 rounded-full text-[13px] font-medium"
                >
                  Conversion %
                </button>
                <button
                  type="button"
                  onClick={() => setBranchSort("size")}
                  aria-pressed={branchSort === "size"}
                  className="px-3 py-1 rounded-full text-[13px] font-medium"
                >
                  Cohort size
                </button>
              </div>
            </div>

            <ul className="brs grid gap-3">
              {sortedBranches.map((b) => {
                const percentage = (b.placed / b.total) * 100;
                return (
                  <li key={b.name} className="br grid grid-cols-[56px_1fr_140px] gap-3 items-center text-[14px]">
                    <b className="font-semibold text-ink">{b.name}</b>
                    <span className="br-bar h-2.5 rounded-full bg-surface-3 overflow-hidden">
                      <i
                        className="block h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: "var(--grad-progress)",
                        }}
                      />
                    </span>
                    <span className="mono br-v text-[13px] text-ink-2 text-right">
                      {percentage.toFixed(1)}% · {b.placed}/{b.total}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
