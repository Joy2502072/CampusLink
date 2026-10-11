"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ACTIVE_DRIVES, Drive } from "@/lib/data/mockData";
import { eventBus } from "@/lib/bus";

export default function StudentJobsAndOffersPage() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [appliedDriveIds, setAppliedDriveIds] = useState<string[]>(["DRV-101"]);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [undoToast, setUndoToast] = useState<{ id: string; company: string } | null>(null);

  const drives = ACTIVE_DRIVES.slice(0, 4);

  const handleApply = (drive: Drive) => {
    if (appliedDriveIds.includes(drive.id)) {
      setAppliedDriveIds(appliedDriveIds.filter((id) => id !== drive.id));
      setUndoToast(null);
    } else {
      setAppliedDriveIds([...appliedDriveIds, drive.id]);
      setUndoToast({ id: drive.id, company: drive.company });

      eventBus.publish({
        type: "DRIVE_ANNOUNCED",
        title: "Application submitted",
        message: `Ananya Mohanty applied to ${drive.company}`,
        companyName: drive.company,
      });

      setTimeout(() => setUndoToast(null), 4000);
    }
  };

  const handleUndo = () => {
    if (undoToast) {
      setAppliedDriveIds(appliedDriveIds.filter((id) => id !== undoToast.id));
      setUndoToast(null);
    }
  };

  return (
    <AppShell onStartWalkthrough={() => setShowWalkthrough(true)}>
      <div className="space-y-6">
        {/* Header & Sub-Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 hairline-b">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Student portal · Roll 2201201045
            </div>
            <h1 className="text-[20px] font-semibold text-ink tracking-tight mt-0.5">
              Drives & Corporate Offers
            </h1>
            <div className="text-[13px] text-ink-3">
              Matched campus drives · Season 2026-27
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/student"
              className="px-3 py-1.5 rounded-full text-ink-3 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Readiness profile
            </Link>
            <Link
              href="/student/jobs"
              className="px-3 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              Drives & offers
            </Link>
          </div>
        </div>

        {/* Official Extended Offer Card — Stable, Sharp & Presentation-Crisp */}
        <div className="bg-surface rounded-[14px] border border-line p-5 sm:p-6 shadow-card shadow-card-hover space-y-3 scroll-reveal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-mint-tint text-mint-dark">
                Official offer extended
              </span>
              <h2 className="text-[16px] font-semibold text-ink mt-1">
                Apex Cloud Technologies · Associate Cloud Engineer
              </h2>
              <div className="text-[12px] text-ink-3 mt-0.5">
                Bangalore · Joining July 2027 · Response deadline: 25 Oct 2026
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[18px] font-semibold text-mint-dark">
                  34.0 LPA
                </div>
                <div className="text-[11px] text-ink-3">Total compensation</div>
              </div>

              <button
                type="button"
                onClick={() => setOfferAccepted(!offerAccepted)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all shadow-xs cursor-pointer ${
                  offerAccepted
                    ? "bg-mint-dark text-white"
                    : "bg-accent text-white hover:bg-accent-hover"
                }`}
              >
                {offerAccepted ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      className="ck-draw"
                    >
                      <polyline
                        points="4 10 8 14 16 6"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Offer accepted</span>
                  </>
                ) : (
                  <span>Accept offer</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Matched Drives Cards */}
        <div className="space-y-3 scroll-reveal-1">
          <h2 className="text-[14px] font-semibold text-ink">
            Active campus recruitment drives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d) => {
              const isApplied = appliedDriveIds.includes(d.id);
              return (
                <SpotlightCard
                  key={d.id}
                  className="p-5 shadow-card flex flex-col justify-between gap-4"
                  spotlightColor="rgba(79, 70, 229, 0.07)"
                  borderColor="rgba(79, 70, 229, 0.25)"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">
                          {d.company}
                        </h3>
                        <div className="text-[12px] text-ink-3 mt-0.5">
                          {d.title}
                        </div>
                      </div>
                      <span className="font-mono text-[13px] font-semibold text-ink-2 bg-subtle px-2.5 py-1 rounded-full">
                        {d.packageLPA}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-3 font-mono">
                      <span>Drive: {d.date}</span>
                      <span>·</span>
                      <span>Min CGPA: {d.minCgpa}</span>
                    </div>

                    {/* Must-have skill chips */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {d.mustHaveSkills.slice(0, 3).map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-subtle text-ink-2"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apply Action with Self-Drawing Checkmark */}
                  <div className="pt-3 hairline-t flex items-center justify-between">
                    <span className="text-[12px] text-ink-3">
                      {d.appliedCount} students registered
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApply(d)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all shadow-xs cursor-pointer ${
                        isApplied
                          ? "bg-mint-tint text-mint-dark border border-mint font-semibold"
                          : "border border-accent text-accent hover:bg-accent-tint"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 20 20"
                            className="ck-draw"
                          >
                            <polyline
                              points="4 10 8 14 16 6"
                              fill="none"
                              stroke="var(--mint-dark)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Applied</span>
                        </>
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Undo Toast */}
        {undoToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-line text-ink px-4 py-2.5 rounded-full shadow-card text-[13px] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span>Applied to {undoToast.company}</span>
            <button
              onClick={handleUndo}
              className="text-accent underline font-medium hover:text-ink cursor-pointer"
            >
              Undo
            </button>
          </div>
        )}
      </div>

      {showWalkthrough && <GuidedDemo onClose={() => setShowWalkthrough(false)} />}
    </AppShell>
  );
}
