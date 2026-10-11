"use client";

import React, { useState } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface GlareHoverProps {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
}

export function GlareHover({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.25)",
}: GlareHoverProps) {
  const { isFull } = useEffects();
  const [sweeping, setSweeping] = useState(false);

  const handleMouseEnter = () => {
    if (!isFull || sweeping) return;
    setSweeping(true);
    setTimeout(() => setSweeping(false), 800);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden ${className}`}
    >
      {isFull && sweeping && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            background: `linear-gradient(105deg, transparent 20%, ${glareColor} 50%, transparent 80%)`,
            animation: "glareSweep 700ms ease forwards",
          }}
        />
      )}
      <style jsx>{`
        @keyframes glareSweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      {children}
    </div>
  );
}
