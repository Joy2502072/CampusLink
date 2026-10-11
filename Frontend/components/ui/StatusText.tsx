import React from "react";

export type StatusVariant = "ok" | "warn" | "bad" | "accent" | "neutral";

interface StatusTextProps {
  status: StatusVariant;
  children?: React.ReactNode;
  text?: string;
  className?: string;
  size?: "sm" | "base";
}

export function StatusText({
  status,
  children,
  text,
  className = "",
  size = "base",
}: StatusTextProps) {
  const dotColor = {
    ok: "bg-ok",
    warn: "bg-warn",
    bad: "bg-bad",
    accent: "bg-accent",
    neutral: "bg-ink-3",
  }[status];

  const textColor = {
    ok: "text-ok",
    warn: "text-warn",
    bad: "text-bad",
    accent: "text-accent",
    neutral: "text-ink-2",
  }[status];

  const textSize = size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${textSize} ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span>{children ?? text}</span>
    </span>
  );
}
