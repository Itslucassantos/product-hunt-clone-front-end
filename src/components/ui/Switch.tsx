"use client";

import { useId } from "react";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  const id = useId();

  return (
    <div className="flex min-h-12 items-center justify-between gap-4">
      <span id={id} className="text-sm font-semibold">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-[46px] shrink-0 rounded-full ${checked ? "bg-primary" : "bg-border-strong"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-[left] motion-reduce:transition-none ${checked ? "left-[22px]" : "left-1"}`}
        />
      </button>
    </div>
  );
}
