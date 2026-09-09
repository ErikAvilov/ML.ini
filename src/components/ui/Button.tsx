"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-ml-accent text-[var(--ml-text-on-primary)] hover:bg-ml-accent-bright active:translate-y-px disabled:translate-y-0",
  secondary:
    "bg-ml-surface-1 text-ml-text border border-[color-mix(in_srgb,var(--ml-secondary)_55%,var(--ml-border))] hover:border-ml-border-strong hover:bg-ml-surface-hover active:translate-y-px",
  ghost:
    "bg-transparent text-ml-text-secondary hover:text-ml-text hover:bg-ml-surface-hover",
  danger:
    "bg-[var(--ml-danger-soft)] text-ml-danger border border-[color-mix(in_srgb,var(--ml-danger)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--ml-danger)_18%,transparent)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      variant = "primary",
      size = "md",
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) {
    const sizes = {
      sm: "px-3 py-1.5 text-[length:var(--ml-text-sm)]",
      md: "px-4 py-2.5 text-[length:var(--ml-text-sm)]",
      lg: "px-5 py-3 text-[length:var(--ml-text-base)]",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        {...props}
      />
    );
  }
);
