import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "hover" | "ai" | "accent";
  className?: string;
}

export function GlassCard({
  children,
  variant = "default",
  className,
  ...props
}: GlassCardProps) {
  const baseClasses = "glass-panel rounded-2xl p-6 transition-all duration-300";

  const variantClasses = {
    default: "",
    hover: "glass-panel-hover cursor-pointer",
    ai: "border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.08)]",
    accent: "border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.1)]",
  };

  return (
    <div
      className={twMerge(clsx(baseClasses, variantClasses[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
}
