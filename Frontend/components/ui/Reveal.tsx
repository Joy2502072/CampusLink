"use client";

import React from "react";
import { AnimatedContent } from "@/components/reactbits/AnimatedContent";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "vertical" | "horizontal";
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "vertical",
}: RevealProps) {
  return (
    <AnimatedContent
      direction={direction}
      delay={delay}
      distance={14}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
