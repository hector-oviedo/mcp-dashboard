// /src/components/ui/button.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: React.ReactNode;
  variant?: Variant | null | undefined | ""; // tolerate weird values
};

const normalize = (v: ButtonProps["variant"]): Variant =>
  v === "secondary" ? "secondary" : "primary";

export function Button({
  className,
  leftIcon,
  variant,
  children,
  ...props
}: ButtonProps) {
  const v = normalize(variant);

  const base =
    "group/btn relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition";

  const primary = cn(
    "bg-gradient-to-br from-[var(--btn-from)] to-[var(--btn-to)]",
    "text-[color:var(--btn-text)] border border-[color:var(--btn-border)]",
    "shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]",
    "dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
  );

  const secondary = cn(
    "bg-secondary text-foreground border border-border",
    "shadow-input dark:shadow-[0px_0px_1px_1px_#262626]"
  );

  return (
    <button className={cn(base, v === "primary" ? primary : secondary, className)} {...props}>
      {leftIcon ? <span className="mr-2 inline-flex">{leftIcon}</span> : null}
      {children}
    <span className="pointer-events-none absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="pointer-events-none absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[var(--fx-2)] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </button>
  );
}