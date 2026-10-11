"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { StatusText } from "@/components/ui/StatusText";
import { Chip } from "@/components/ui/Chip";
import { ACTIVE_DRIVES, HERO_STUDENTS } from "@/lib/data/mockData";

export default function SkillGapPage() {
  const [selectedDriveId, setSelectedDriveId] = useState("DRV-101");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [checkedBoosters, setCheckedBoosters] = useState<string[]>([]);

  const drive = ACTIVE_DRIVES.find((d) => d.id === selectedDriveId) || ACTIVE_DRIVES[0];
  const student = HERO_STUDENTS[0];

  const boosters = [
    {
      id: "b-docker",
      label: "Complete Docker containerization module",
      delta: 6.7,
      detail: "Fulfills Apex Cloud Technologies' container benchmark",
    },
    {
      id: "b-aws",
      label: "Pass AWS Cloud Practitioner proctored exam",
      delta: 8.5,
      detail: "Converts AWS from self-reported to verified competency",
    },
    {
      id: "b-system-design",
      label: "Complete architecture mock interview lab",
      delta: 5.2,
      detail: "Increases technical interview diagnostic score from 82 to 92",
    },
  ];

  const baseScore = 78.5;
  const added = checkedBoosters.reduce((acc, id) => {
    const b = boosters.find((item) => item.id === id);
    return acc + (b ? b.delta : 0);
  }, 0);
  const simulatedScore = Math.min(100, Math.round((baseScore + added) * 10) / 10);

  const toggleBooster = (id: string) => {
    if (checkedBoosters.includes(id)) {
      setCheckedBoosters(checkedBoosters.filter((b) => b !== id));
    } else {
      setCheckedBoosters([...checkedBoosters, id]);
    }
  };

  return (
    <AppShell onStartWalkthrough={() => setShowWalkthrough(true)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 hairline-b">
          <div>
            <h1 className="text-[20px] font-semibold text-ink tracking-tight">
              Skill-gap analysis & preparation simulator
            </h1>
            <div className="text-[13px] text-ink-3 mt-0.5">
              Evaluating candidate against target job requirements
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-3">Target drive:</span>
            <select
              value={selectedDriveId}
              onChange={(e) => {
                setSelectedDriveId(e.target.value);
                setCheckedBoosters([]);
              }}
              className="bg-surface hairline-all rounded-[8px] px-2.5 py-1 text-[13px] text-ink font-medium cursor-pointer"
            >
              {ACTIVE_DRIVES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company} — {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Drive Requirements & Match Status */}
          <div className="lg:col-span-6 bg-surface hairline-all rounded-[12px] p-5 space-y-5">
            <div className="pb-3 hairline-b">
              <div className="text-[14px] font-semibold text-ink">{drive.company}</div>
              <div className="text-[12px] text-ink-3">{drive.title} · {drive.packageLPA}</div>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between py-1.5 hairline-b">
                <span className="text-ink-2">Academic CGPA filter</span>
                <span className="font-mono text-ink font-medium">Min {drive.minCgpa} (Candidate has {student.cgpa})</span>
              </div>
              <div className="flex justify-between py-1.5 hairline-b">
                <span className="text-ink-2">Eligible branches</span>
                <span className="text-ink">{drive.branches.join(", ")}</span>
              </div>
            </div>

            {/* Requirements list with clean check and x icons */}
            <div className="space-y-2 pt-1">
              <div className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">
                Mandatory competencies
              </div>
              <ul className="space-y-2 text-[13px]">
                {drive.mustHaveSkills.map((s) => {
                  const studentHas = student.skills.some(
                    (sk) => sk.name.toLowerCase() === s.toLowerCase()
                  );
                  return (
                    <li key={s} className="flex items-center justify-between py-1">
                      <span className="text-ink font-medium">{s}</span>
                      {studentHas ? (
                        <span className="flex items-center gap-1 text-ok text-[12px]">
                          <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Matched</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-bad text-[12px]">
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Missing</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right Column: Simulator */}
          <div className="lg:col-span-6 bg-surface hairline-all rounded-[12px] p-5 space-y-5">
            <div className="flex items-baseline justify-between pb-3 hairline-b">
              <span className="text-[13px] font-semibold text-ink">What-if preparation simulator</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[20px] font-semibold text-accent tabular-nums">
                  {simulatedScore}
                </span>
                <span className="text-[12px] text-ink-3 font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-[13px] text-ink-2 leading-relaxed">
              Select preparation milestones below to simulate prospective score changes:
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {boosters.map((b) => {
                const isChecked = checkedBoosters.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`block p-3 rounded-[8px] hairline-all cursor-pointer transition-colors ${
                      isChecked ? "bg-accent-tint/50 border-accent/40" : "bg-subtle hover:bg-subtle/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBooster(b.id)}
                        className="accent-accent mt-1"
                      />
                      <div className="space-y-0.5 text-[13px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-ink">{b.label}</span>
                          <span className="font-mono text-[12px] text-ok font-medium">+{b.delta}</span>
                        </div>
                        <p className="text-[12px] text-ink-3 leading-tight">{b.detail}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Projected Band */}
            <div className="pt-2 hairline-t flex items-center justify-between text-[13px]">
              <span className="text-ink-2">Projected placement band:</span>
              <StatusText status={simulatedScore >= 85 ? "ok" : "accent"} size="sm">
                {simulatedScore >= 85 ? "Highly employable" : "Ready"}
              </StatusText>
            </div>
          </div>
        </div>
      </div>

      {showWalkthrough && <GuidedDemo onClose={() => setShowWalkthrough(false)} />}
    </AppShell>
  );
}
