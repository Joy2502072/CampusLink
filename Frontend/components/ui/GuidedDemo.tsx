"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

interface Step {
  step: number;
  title: string;
  badge: string;
  route: string;
  description: string;
  keyFeature: string;
}

const DEMO_STEPS: Step[] = [
  {
    step: 1,
    title: "Student readiness & live simulator",
    badge: "PS Requirement 1",
    route: "/student",
    description:
      "Continuous student profiling evaluating CGPA, proctored verified skills, and interactive live preparation simulation with self-drawing checkmarks.",
    keyFeature: "Color-morphing score ring and live what-if checklist: checking Docker boosts score by +6.7 pts.",
  },
  {
    step: 2,
    title: "Student drives and offer acceptance",
    badge: "PS Requirement 1 & Offer Tracking",
    route: "/student/jobs",
    description:
      "Direct matched corporate drives with inline application and official extended offer management for the 2026-27 graduating cohort.",
    keyFeature: "Apex Cloud extended offer with 34.0 LPA compensation and pre-employment compliance verification.",
  },
  {
    step: 3,
    title: "Recruiter job description parsing",
    badge: "PS Requirement 2",
    route: "/recruiter/drives/new",
    description:
      "Paste any raw recruiter job description to extract core competencies, must-haves, nice-to-haves, CGPA cutoffs, and eligible branches with deterministic boundaries.",
    keyFeature: "Extraction scanner with instant editable competency chips.",
  },
  {
    step: 4,
    title: "Recruiter matching and non-topper filter",
    badge: "Recruiter matching",
    route: "/recruiter",
    description:
      "Explainable candidate ranking with live weight sliders that dynamically re-rank candidates on the client, plus the non-topper filter to discover capable students.",
    keyFeature: "Live weight sliders with rank delta indicator and non-topper discovery filter.",
  },
  {
    step: 5,
    title: "Conflict-aware drive scheduling",
    badge: "PS Requirement 3",
    route: "/cell/scheduler",
    description:
      "Automatic detection of campus exam calendar clashes, venue double-bookings, and student interview collisions with one-click resolution.",
    keyFeature: "Venue-by-time timetable grid with conflict detection and automated resolution.",
  },
  {
    step: 6,
    title: "Placement command center analytics",
    badge: "PS Requirement 5 & 6",
    route: "/cell",
    description:
      "Real-time institutional oversight: branch conversion rates, salary distribution trends, at-risk student intervention, and curriculum gap alerts.",
    keyFeature: "KPI metrics and industry demand versus academic supply comparison.",
  },
  {
    step: 7,
    title: "Judges' corner: architecture and scalability",
    badge: "Deliverables 8, 9, 11, 12",
    route: "/system",
    description:
      "Comprehensive system blueprint, transparent scoring formula specification, multi-campus scalability roadmap, and role-based data security controls.",
    keyFeature: "Interactive formula calculator and full system architecture document.",
  },
];

export function GuidedDemo({ onClose }: { onClose: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      router.push(DEMO_STEPS[nextIndex].route);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      router.push(DEMO_STEPS[prevIndex].route);
    }
  };

  return (
    <aside
      aria-label="Walkthrough guide"
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-surface border border-line-strong rounded-xl p-4 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 hairline-b">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-ink-3">
            Step {currentStep.step} of {DEMO_STEPS.length}
          </span>
          <span className="text-[11px] text-ink-3">·</span>
          <span className="text-[11px] text-ink-2 font-medium">
            {currentStep.badge}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close walkthrough"
          className="text-ink-3 hover:text-ink p-1 -mr-1 rounded hover:bg-subtle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="py-3 space-y-2">
        <h3 className="text-[14px] font-semibold text-ink leading-snug">
          {currentStep.title}
        </h3>
        <p className="text-[12px] text-ink-2 leading-relaxed">
          {currentStep.description}
        </p>

        <div className="p-2.5 rounded bg-subtle border border-line text-[12px] text-ink leading-snug">
          <div className="text-[11px] font-medium text-ink-3 mb-0.5">
            Key highlight:
          </div>
          {currentStep.keyFeature}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 hairline-t">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:text-ink disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-subtle flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        <button
          onClick={handleNext}
          className="px-3 py-1.5 text-[12px] font-medium bg-accent text-white hover:bg-accent-hover rounded flex items-center gap-1"
        >
          <span>{currentStepIndex === DEMO_STEPS.length - 1 ? "Finish tour" : "Next step"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
