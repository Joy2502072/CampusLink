"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface AuroraProps {
  className?: string;
  tiltColor?: "student" | "recruiter" | "cell" | "neutral";
}

export function Aurora({ className = "", tiltColor = "neutral" }: AuroraProps) {
  const { isFull } = useEffects();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Tilt colors:
  // Student -> leans toward Mint
  // Recruiter -> leans toward Electric Iris
  // Cell -> leans toward Peach/Amber
  const getBlobs = () => {
    switch (tiltColor) {
      case "student":
        return {
          b1: "var(--mint-soft)",
          b2: "var(--primary-soft)",
          b3: "var(--mint)",
        };
      case "recruiter":
        return {
          b1: "var(--primary-soft)",
          b2: "var(--mesh-1)",
          b3: "var(--primary)",
        };
      case "cell":
        return {
          b1: "var(--peach-tint)",
          b2: "var(--amber-soft)",
          b3: "var(--amber)",
        };
      default:
        return {
          b1: "var(--mesh-1)",
          b2: "var(--mesh-2)",
          b3: "var(--mesh-3)",
        };
    }
  };

  const { b1, b2, b3 } = getBlobs();
  const shouldAnimate = isFull && isVisible;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden max-h-[35vh] ${className}`}
      aria-hidden="true"
    >
      <div
        className="mesh-blob"
        style={{
          width: "360px",
          height: "360px",
          left: "-60px",
          top: "-120px",
          background: `radial-gradient(circle, ${b1}, transparent 70%)`,
          animationPlayState: shouldAnimate ? "running" : "paused",
        }}
      />
      <div
        className="mesh-blob"
        style={{
          width: "320px",
          height: "320px",
          right: "-40px",
          top: "-90px",
          background: `radial-gradient(circle, ${b2}, transparent 70%)`,
          animationDelay: "-5s",
          animationPlayState: shouldAnimate ? "running" : "paused",
        }}
      />
      <div
        className="mesh-blob"
        style={{
          width: "300px",
          height: "300px",
          left: "38%",
          top: "20px",
          background: `radial-gradient(circle, ${b3}, transparent 70%)`,
          animationDelay: "-9s",
          animationPlayState: shouldAnimate ? "running" : "paused",
        }}
      />
    </div>
  );
}
