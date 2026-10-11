"use client";

import React, { Children, isValidElement } from "react";
import { useEffects } from "@/lib/context/EffectsContext";

interface AnimatedListProps {
  children: React.ReactNode;
  stagger?: number; // ms delay between items
  className?: string;
}

export function AnimatedList({
  children,
  stagger = 70,
  className = "",
}: AnimatedListProps) {
  const { isFull } = useEffects();
  const childrenArray = Children.toArray(children);

  return (
    <div className={`space-y-2 ${className}`}>
      {childrenArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <div
            key={index}
            className={
              isFull
                ? "transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] animate-in fade-in slide-in-from-bottom-2"
                : ""
            }
            style={{
              animationDelay: isFull ? `${index * stagger}ms` : "0ms",
              animationFillMode: "both",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
