"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
}

export function BlurText({
  text,
  delay = 100,
  className = "",
  animateBy = "words",
}: BlurTextProps) {
  const { isFull } = useEffects();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLHeadingElement | HTMLSpanElement>(null);

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

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {elements.map((el, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            marginRight: animateBy === "words" ? "0.28em" : "0",
            opacity: inView ? 1 : 0,
            filter: inView ? "blur(0px)" : "blur(8px)",
            transform: inView ? "none" : "translateY(10px)",
            transitionDelay: inView ? `${i * delay}ms` : "0ms",
          }}
        >
          {el}
        </span>
      ))}
    </span>
  );
}
