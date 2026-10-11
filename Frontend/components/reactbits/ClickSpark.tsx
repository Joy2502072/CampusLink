"use client";

import React, { useState } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ClickSpark({
  children,
  sparkColor = "var(--primary)",
  className = "",
  onClick,
}: ClickSparkProps) {
  const { isFull } = useEffects();
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
    if (!isFull) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSpark = { id: Date.now(), x, y };
    setSparks((prev) => [...prev, newSpark]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 450);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-block overflow-hidden ${className}`}
    >
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full z-40 animate-ping"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            backgroundColor: sparkColor,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {children}
    </div>
  );
}
