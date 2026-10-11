import React from "react";

interface ChipProps {
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
}

export function Chip({ children, className = "", onRemove }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-line rounded-[6px] px-2 py-0.5 text-[12px] text-ink-2 bg-surface font-sans ${className}`}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-ink-3 hover:text-ink text-[13px] leading-none ml-0.5"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
