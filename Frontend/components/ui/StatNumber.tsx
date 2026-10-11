"use client";

import React from "react";
import { CountUp } from "@/components/reactbits/CountUp";

interface StatNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function StatNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: StatNumberProps) {
  return (
    <CountUp
      to={value}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  );
}
