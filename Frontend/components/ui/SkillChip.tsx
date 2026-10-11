import React from "react";
import { ShieldCheck, Check, X } from "lucide-react";

interface SkillChipProps {
  name: string;
  status?: "matched" | "missing" | "neutral" | "nice_to_have";
  verified?: boolean;
  proficiency?: number; // 1 to 5
  onClick?: () => void;
}

export function SkillChip({
  name,
  status = "neutral",
  verified = false,
  proficiency,
  onClick,
}: SkillChipProps) {
  let styleClasses = "bg-slate-800/60 text-slate-200 border-white/10 hover:border-slate-500/40";
  let iconElement = null;

  if (status === "matched") {
    styleClasses = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    iconElement = <Check className="w-3 h-3 text-emerald-400" />;
  } else if (status === "missing") {
    styleClasses = "bg-rose-500/10 text-rose-300 border-rose-500/30";
    iconElement = <X className="w-3 h-3 text-rose-400" />;
  } else if (status === "nice_to_have") {
    styleClasses = "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm transition-all duration-200 ${styleClasses} ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      }`}
    >
      {iconElement}
      <span>{name}</span>
      {verified && (
        <span title="Proctor Verified Skill" className="text-cyan-400 inline-flex items-center">
          <ShieldCheck className="w-3.5 h-3.5" />
        </span>
      )}
      {proficiency && (
        <span className="flex items-center gap-0.5 ml-0.5">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <span
              key={lvl}
              className={`w-1 h-1 rounded-full ${
                lvl <= proficiency ? "bg-cyan-400" : "bg-slate-700"
              }`}
            />
          ))}
        </span>
      )}
    </span>
  );
}
