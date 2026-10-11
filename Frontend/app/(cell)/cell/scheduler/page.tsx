"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { StatusText } from "@/components/ui/StatusText";
import { eventBus } from "@/lib/bus";
import { AlertCircle, CheckCircle, RotateCcw } from "lucide-react";

interface DriveBooking {
  id: string;
  timeSlot: string; // "09:00 - 11:00" | "11:30 - 13:30" | "14:00 - 16:00" | "16:00 - 18:00"
  venue: string; // "Seminar Hall A" | "Seminar Hall B" | "Tech Lab 3" | "Auditorium 1"
  company: string;
  role: string;
  type: "Drive" | "Pre-placement talk" | "Technical test";
  hasConflict: boolean;
  conflictType?: "Exam collision" | "Double booking";
  conflictDetail?: string;
}

const VENUES = [
  { name: "Seminar Hall A", capacity: 250 },
  { name: "Seminar Hall B", capacity: 180 },
  { name: "Tech Lab 3", capacity: 90 },
  { name: "Auditorium 1", capacity: 500 },
];

const TIME_SLOTS = [
  "09:00 - 11:00",
  "11:30 - 13:30",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

const INITIAL_BOOKINGS: DriveBooking[] = [
  {
    id: "b-1",
    timeSlot: "09:00 - 11:00",
    venue: "Seminar Hall A",
    company: "Apex Cloud Technologies",
    role: "Associate Cloud Engineer",
    type: "Technical test",
    hasConflict: true,
    conflictType: "Exam collision",
    conflictDetail: "Clash with BPUT Mid-Semester Examination for CSE and IT departments.",
  },
  {
    id: "b-2",
    timeSlot: "09:00 - 11:00",
    venue: "Seminar Hall A",
    company: "Titan Heavy Engineering",
    role: "Graduate Engineer Trainee",
    type: "Drive",
    hasConflict: true,
    conflictType: "Double booking",
    conflictDetail: "Both Apex Cloud and Titan Heavy allocated to Seminar Hall A at 09:00.",
  },
  {
    id: "b-3",
    timeSlot: "14:00 - 16:00",
    venue: "Tech Lab 3",
    company: "Zenith Digital Services",
    role: "Full Stack Software Analyst",
    type: "Drive",
    hasConflict: false,
  },
  {
    id: "b-4",
    timeSlot: "16:00 - 18:00",
    venue: "Auditorium 1",
    company: "Nexus Core Systems",
    role: "Pre-Placement Talk",
    type: "Pre-placement talk",
    hasConflict: false,
  },
];

const RESOLVED_BOOKINGS: DriveBooking[] = [
  {
    id: "b-1-fixed",
    timeSlot: "11:30 - 13:30",
    venue: "Seminar Hall B",
    company: "Apex Cloud Technologies",
    role: "Associate Cloud Engineer",
    type: "Technical test",
    hasConflict: false,
  },
  {
    id: "b-2-fixed",
    timeSlot: "14:00 - 16:00",
    venue: "Seminar Hall A",
    company: "Titan Heavy Engineering",
    role: "Graduate Engineer Trainee",
    type: "Drive",
    hasConflict: false,
  },
  {
    id: "b-3",
    timeSlot: "14:00 - 16:00",
    venue: "Tech Lab 3",
    company: "Zenith Digital Services",
    role: "Full Stack Software Analyst",
    type: "Drive",
    hasConflict: false,
  },
  {
    id: "b-4",
    timeSlot: "16:00 - 18:00",
    venue: "Auditorium 1",
    company: "Nexus Core Systems",
    role: "Pre-Placement Talk",
    type: "Pre-placement talk",
    hasConflict: false,
  },
];

export default function ConflictSchedulerPage() {
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [isResolved, setIsResolved] = useState(false);
  const [showGuidedDemo, setShowGuidedDemo] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const bookings = isResolved ? RESOLVED_BOOKINGS : INITIAL_BOOKINGS;
  const hasConflict = bookings.some((b) => b.hasConflict);

  const handleApplyFix = () => {
    setIsResolved(true);
    eventBus.publish({
      type: "SLOT_ASSIGNED",
      title: "Schedule conflict resolved",
      message: "Apex Cloud relocated to Seminar Hall B at 11:30. Exam collisions cleared.",
      companyName: "Placement Cell Office",
    });
  };

  const handleReset = () => {
    setIsResolved(false);
    setShowDemoMenu(false);
  };

  return (
    <AppShell onStartWalkthrough={() => setShowGuidedDemo(true)}>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pb-2 hairline-b text-[13px]">
          <Link
            href="/cell"
            className="px-3 py-1.5 rounded-full text-ink-3 hover:text-ink hover:bg-surface/60 transition-colors"
          >
            Command overview
          </Link>
          <Link
            href="/cell/scheduler"
            className="px-3 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
          >
            Timetable matrix
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 hairline-b">
          <div>
            <h1 className="text-[20px] font-semibold text-ink tracking-tight">
              Placement drive conflict management
            </h1>
            <div className="text-[13px] text-ink-3 mt-0.5">
              Resource and examination conflict engine · Season 2026-27
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="schedule-date" className="text-[12px] text-ink-3">
                Date:
              </label>
              <select
                id="schedule-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input text-[12px] py-1 px-2.5 bg-surface text-ink font-mono border border-line rounded"
              >
                <option value="2026-10-15">15 Oct 2026 (Demo conflict)</option>
                <option value="2026-10-18">18 Oct 2026 (Clear)</option>
                <option value="2026-10-22">22 Oct 2026 (Clear)</option>
              </select>
            </div>

            {/* Demo Controls Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="btn-secondary text-[12px] py-1 px-2.5 bg-surface border border-line rounded text-ink cursor-pointer"
              >
                Demo controls
              </button>
              {showDemoMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-surface border border-line-strong rounded-lg shadow-card p-1.5 z-20 text-[12px]">
                  <button
                    onClick={handleReset}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-subtle text-ink flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-ink-3" />
                    Reset demo state
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inline Conflict Alert */}
        {hasConflict && (
          <div className="p-4 rounded-lg border border-coral/40 bg-coral-tint flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 scroll-reveal">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-coral-dark shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-semibold text-coral-dark">
                  2 scheduling conflicts detected on 15 Oct 2026
                </div>
                <div className="text-[12px] text-coral-dark/90 mt-0.5">
                  BPUT Mid-Semester Examination overlap for CSE/IT students and venue double-booking in Seminar Hall A.
                </div>
              </div>
            </div>
            <button
              onClick={handleApplyFix}
              className="px-3.5 py-1.5 text-[12px] font-medium bg-accent text-white hover:bg-accent-hover rounded shrink-0 shadow-xs cursor-pointer"
            >
              Apply suggested fix
            </button>
          </div>
        )}

        {/* Inline Resolved Notice */}
        {isResolved && (
          <div className="p-4 rounded-lg border border-mint/40 bg-mint-tint flex items-center justify-between gap-3 text-[13px] scroll-reveal">
            <div className="flex items-center gap-2 text-mint-dark font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                Schedule resolved: Apex Cloud relocated to Seminar Hall B at 11:30. Zero academic exam collisions.
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-[12px] text-ink-3 hover:text-ink underline shrink-0 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Timetable Matrix */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold text-ink uppercase tracking-wider">
              Venue by time allocation matrix
            </h2>
            <span className="text-[12px] text-ink-3">
              Operating window: 09:00 to 18:00
            </span>
          </div>

          <div className="border border-line rounded-lg overflow-x-auto bg-surface">
            <table className="w-full border-collapse text-left min-w-[760px]">
              <thead>
                <tr className="bg-subtle hairline-b text-[12px] text-ink-2 font-medium">
                  <th className="p-3 w-32 border-r border-line">Time slot</th>
                  {VENUES.map((v) => (
                    <th key={v.name} className="p-3 border-r border-line last:border-r-0">
                      <div>{v.name}</div>
                      <div className="text-[11px] text-ink-3 font-normal">
                        Capacity: {v.capacity}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {TIME_SLOTS.map((slotTime) => {
                  return (
                    <tr key={slotTime} className="hover:bg-subtle/50">
                      <td className="p-3 font-mono text-[12px] text-ink-2 border-r border-line align-top bg-subtle/30 font-medium">
                        {slotTime}
                      </td>
                      {VENUES.map((v) => {
                        const matchedBookings = bookings.filter(
                          (b) => b.timeSlot === slotTime && b.venue === v.name
                        );

                        return (
                          <td
                            key={v.name}
                            className="p-2.5 border-r border-line last:border-r-0 align-top"
                          >
                            {matchedBookings.length === 0 ? (
                              <div className="text-[12px] text-ink-3 italic py-1">
                                Available
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {matchedBookings.map((b) => (
                                  <div
                                    key={b.id}
                                    className={`p-2.5 rounded border text-[12px] ${
                                      b.hasConflict
                                        ? "border-coral/40 bg-coral-tint text-coral-dark"
                                        : "border-line bg-surface text-ink"
                                    }`}
                                  >
                                    <div className="font-medium text-ink">
                                      {b.company}
                                    </div>
                                    <div className="text-[11px] text-ink-3 mt-0.5">
                                      {b.role} · {b.type}
                                    </div>
                                    {b.hasConflict && (
                                      <div className="mt-1.5 pt-1.5 border-t border-coral/30 text-[11px] text-coral-dark font-medium">
                                        Conflict: {b.conflictType}
                                        <div className="text-[11px] font-normal text-coral-dark/90 mt-0.5">
                                          {b.conflictDetail}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Allocation List */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[13px] font-semibold text-ink uppercase tracking-wider">
            Allocated drives summary
          </h2>
          <div className="border border-line rounded-lg overflow-hidden bg-surface">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-subtle hairline-b text-[12px] text-ink-2">
                <tr>
                  <th className="p-3">Company and role</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Time slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-subtle/50">
                    <td className="p-3">
                      <div className="font-medium text-ink">{b.company}</div>
                      <div className="text-[12px] text-ink-3">{b.role}</div>
                    </td>
                    <td className="p-3 text-ink-2">{b.venue}</td>
                    <td className="p-3 font-mono text-[12px] text-ink-2">
                      {b.timeSlot}
                    </td>
                    <td className="p-3">
                      {b.hasConflict ? (
                        <StatusText status="bad" text={b.conflictType || "Conflict"} />
                      ) : (
                        <StatusText status="ok" text="Confirmed" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showGuidedDemo && <GuidedDemo onClose={() => setShowGuidedDemo(false)} />}
    </AppShell>
  );
}
