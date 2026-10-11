"use client";

import React, { useRef, useState } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "var(--spot)",
  borderColor = "rgba(79, 70, 229, 0.25)",
}: SpotlightCardProps) {
  const { isFull } = useEffects();
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFull || !divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    if (isFull) setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[16px] border border-line bg-surface transition-all duration-200 ${
        isFull ? "hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {/* Dynamic Cursor Spotlight Surface Glow */}
      {isFull && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            opacity,
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Dynamic Cursor Border Highlight */}
      {isFull && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-20"
          style={{
            opacity,
            background: `radial-gradient(240px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 80%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
      )}

      {/* Stationary Crisp Content */}
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
}
