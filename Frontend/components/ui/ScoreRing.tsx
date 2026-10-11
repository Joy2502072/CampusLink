import React from "react";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 110,
  label = "Readiness",
}: ScoreRingProps) {
  const strokeWidth = 2; // Strict 2px clean stroke per design rules
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--line)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[28px] font-semibold tracking-tight text-ink font-mono tabular-nums leading-none">
          {Math.round(score)}
        </span>
        <span className="text-[11px] text-ink-3 mt-1 font-mono">
          of {maxScore}
        </span>
      </div>
    </div>
  );
}
