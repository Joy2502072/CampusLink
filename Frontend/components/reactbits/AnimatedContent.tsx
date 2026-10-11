"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  delay?: number;
  className?: string;
}

export function AnimatedContent({
  children,
  distance = 16,
  direction = "vertical",
  reverse = false,
  delay = 0,
  className = "",
}: AnimatedContentProps) {
  const { isFull } = useEffects();
  const [inView, setInView] = useState(!isFull);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFull) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isFull]);

  const offset = reverse ? -distance : distance;
  const transformStart =
    direction === "vertical" ? `translateY(${offset}px)` : `translateX(${offset}px)`;

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : transformStart,
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
