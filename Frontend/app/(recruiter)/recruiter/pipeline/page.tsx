"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { StatusText } from "@/components/ui/StatusText";
import { ACTIVE_DRIVES } from "@/lib/data/mockData";
import { eventBus } from "@/lib/bus";

interface PipelineCandidate {
  id: string;
  name: string;
  branch: string;
  cgpa: number;
  score: number;
  column: "applied" | "shortlisted" | "technical" | "offered" | "accepted";
  offerRisk?: "LOW" | "MEDIUM" | "HIGH";
  riskDetails?: string;
}

const INITIAL_PIPELINE: PipelineCandidate[] = [
  {
    id: "STU-001",
    name: "Ananya Mohanty",
    branch: "CSE",
    cgpa: 8.85,
    score: 87,
    column: "offered",
    offerRisk: "LOW",
    riskDetails: "92% acceptance probability.",
  },
  {
    id: "STU-002",
    name: "Subham Panda",
    branch: "IT",
    cgpa: 6.82,
    score: 86,
    column: "shortlisted",
    offerRisk: "MEDIUM",
    riskDetails: "Competing offers active with Nexus Core Systems.",
  },
  {
    id: "STU-003",
    name: "Priya Sharma",
    branch: "ECE",
    cgpa: 8.45,
    score: 75,
    column: "technical",
  },
  {
    id: "STU-004",
    name: "Rohan Das",
    branch: "CSE",
    cgpa: 7.4,
    score: 71,
    column: "applied",
  },
];

export default function RecruiterPipelinePage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(INITIAL_PIPELINE);
  const [selectedDriveId, setSelectedDriveId] = useState("DRV-101");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [undoState, setUndoState] = useState<{ id: string; prevCol: PipelineCandidate["column"] } | null>(null);

  const drive = ACTIVE_DRIVES.find((d) => d.id === selectedDriveId) || ACTIVE_DRIVES[0];

  const columns = [
    { key: "applied", label: "Applied" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "technical", label: "Technical interview" },
    { key: "offered", label: "Offer extended" },
    { key: "accepted", label: "Accepted & joined" },
  ] as const;

  const handleAdvance = (candId: string) => {
    const order: PipelineCandidate["column"][] = ["applied", "shortlisted", "technical", "offered", "accepted"];
    const target = candidates.find((c) => c.id === candId);
    if (!target) return;

    const currentIdx = order.indexOf(target.column);
    if (currentIdx < order.length - 1) {
      const nextCol = order[currentIdx + 1];
      setUndoState({ id: candId, prevCol: target.column });
      setCandidates((prev) =>
        prev.map((c) => (c.id === candId ? { ...c, column: nextCol } : c))
      );

      // Bus update
      eventBus.publish({
        type: "OFFER_ISSUED",
        title: "Candidate moved",
        message: `${target.name} advanced to ${nextCol} for ${drive.company}`,
        studentId: target.id,
        studentName: target.name,
      });

      setTimeout(() => setUndoState(null), 4000);
    }
  };

  const handleUndo = () => {
    if (undoState) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === undoState.id ? { ...c, column: undoState.prevCol } : c))
      );
      setUndoState(null);
    }
  };

  return (
    <AppShell onStartWalkthrough={() => setShowWalkthrough(true)}>
      <div className="space-y-6">
        {/* Header & Sub-Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 hairline-b">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Recruiter portal · Pipeline
            </div>
            <h1 className="text-[20px] font-semibold text-ink tracking-tight mt-0.5">
              Candidate Selection Pipeline
            </h1>
            <div className="text-[13px] text-ink-3">
              {drive.company} · {drive.title}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/recruiter"
              className="px-3 py-1.5 rounded-full text-ink-3 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Candidate matching
            </Link>
            <Link
              href="/recruiter/pipeline"
              className="px-3 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              Talent pipeline
            </Link>
            <Link
              href="/recruiter/drives/new"
              className="px-3 py-1.5 rounded-full text-ink-3 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              JD studio
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 scroll-reveal">
          {columns.map((col) => {
            const colCandidates = candidates.filter((c) => c.column === col.key);

            return (
              <div
                key={col.key}
                className="bg-surface hairline-all rounded-[12px] p-3 space-y-3 min-w-[210px] flex flex-col shadow-card"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 hairline-b">
                  <span className="text-[13px] font-medium text-ink">{col.label}</span>
                  <span className="text-[11px] font-mono text-ink-3 tabular-nums">
                    {colCandidates.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 flex-1">
                  {colCandidates.length === 0 ? (
                    <div className="h-24 hairline-all border-dashed rounded-[8px] flex items-center justify-center text-[12px] text-ink-3">
                      No candidates
                    </div>
                  ) : (
                    colCandidates.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-subtle rounded-[8px] space-y-2 text-[13px] border border-line hover:border-line-strong transition-all shadow-xs"
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="font-medium text-ink">{c.name}</span>
                          <span className="font-mono text-[12px] text-ink-2 tabular-nums">
                            {c.score} fit
                          </span>
                        </div>

                        <div className="text-[12px] text-ink-3">
                          {c.branch} · CGPA {c.cgpa}
                        </div>

                        {c.offerRisk && (
                          <div className="text-[11px] pt-0.5">
                            <StatusText status={c.offerRisk === "LOW" ? "ok" : "warn"} size="sm">
                              Risk: {c.offerRisk}
                            </StatusText>
                          </div>
                        )}

                        {col.key !== "accepted" && (
                          <button
                            type="button"
                            onClick={() => handleAdvance(c.id)}
                            className="w-full mt-1 py-1 rounded-[6px] hairline-all bg-surface hover:bg-subtle text-[12px] font-medium text-ink transition-colors shadow-xs cursor-pointer"
                          >
                            Advance stage
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Undo Toast */}
        {undoState && (
          <div className="fixed bottom-6 right-6 z-50 bg-surface border border-line text-ink rounded-[8px] px-4 py-2.5 text-[13px] shadow-card flex items-center gap-3">
            <span>Candidate stage updated.</span>
            <button
              type="button"
              onClick={handleUndo}
              className="text-accent hover:underline font-medium text-[12px] cursor-pointer"
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
