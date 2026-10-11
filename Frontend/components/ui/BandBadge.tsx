import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

export type BandType = "Highly Employable" | "Ready" | "Developing" | "Not Ready" | string;

interface BandBadgeProps {
  band: BandType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function BandBadge({ band, size = "md", showIcon = true }: BandBadgeProps) {
  let styleClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let Icon = Sparkles;

  if (band === "Highly Employable") {
    styleClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]";
    Icon = Sparkles;
  } else if (band === "Ready") {
    styleClasses = "bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]";
    Icon = CheckCircle2;
  } else if (band === "Developing") {
    styleClasses = "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]";
    Icon = AlertTriangle;
  } else if (band === "Not Ready") {
    styleClasses = "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(251,113,133,0.2)]";
    Icon = AlertOctagon;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-200 ${sizeClasses[size]} ${styleClasses}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />}
      <span>{band}</span>
    </span>
  );
}
