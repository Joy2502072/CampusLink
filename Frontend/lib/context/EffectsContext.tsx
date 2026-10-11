"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface EffectsContextType {
  mode: "full" | "lite";
  toggleMode: () => void;
  isFull: boolean;
}

const EffectsContext = createContext<EffectsContextType>({
  mode: "full",
  toggleMode: () => {},
  isFull: true,
});

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"full" | "lite">("full");

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem("campuslink_effects");
    if (saved === "lite" || saved === "full") {
      setMode(saved);
      return;
    }

    // Auto-Lite rules: reduced motion or devices with <= 4 cores
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowCoreDevice = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    if (prefersReducedMotion || isLowCoreDevice) {
      setMode("lite");
    } else {
      setMode("full");
    }
  }, []);

  const toggleMode = () => {
    const nextMode = mode === "full" ? "lite" : "full";
    setMode(nextMode);
    localStorage.setItem("campuslink_effects", nextMode);
  };

  return (
    <EffectsContext.Provider value={{ mode, toggleMode, isFull: mode === "full" }}>
      {children}
    </EffectsContext.Provider>
  );
}

export function useEffects() {
  return useContext(EffectsContext);
}
