import React from "react";

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label?: string;
  className?: string;
  color?: "accent" | "ok" | "warn" | "bad";
}

export function ScoreBar({
  score,
  maxScore = 100,
  label,
  className = "",
  color = "accent",
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const barColor = {
    accent: "bg-accent",
    ok: "bg-ok",
    warn: "bg-warn",
    bad: "bg-bad",
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[12px] mb-1">
          <span className="text-ink-2">{label}</span>
          <span className="font-mono text-ink tabular-nums font-medium">
            {score}
            <span className="text-ink-3 font-normal"> / {maxScore}</span>
          </span>
        </div>
      )}
      <div className="h-1 w-full bg-line rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
