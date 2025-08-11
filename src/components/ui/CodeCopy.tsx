/** /src/components/ui/CodeCopy.tsx
 * Full-width, square, no margins. Copy button flush top-right.
 */
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export function CodeCopy({
  value,
  displayValue,
  className,
}: {
  value: string;
  displayValue?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const ta = document.createElement("textarea");
        ta.value = value; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setCopied(true); setTimeout(() => setCopied(false), 1000);
    } catch {}
  }

  return (
    <div
      className={cn(
        "relative block w-full border border-border bg-secondary font-mono text-xs px-3 py-2",
        "select-all", // square: no rounded
        className
      )}
      title={value}
    >
      <div className="truncate text-[var(--code)]">{displayValue ?? value}</div>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy"
        className={cn(
          "absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center border border-border",
          "bg-background/70 backdrop-blur-[1px] transition hover:outline hover:outline-1 hover:outline-[var(--fx-1)]"
        )}
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
      <span className="pointer-events-none absolute inset-x-0 -bottom-px block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
    </div>
  );
}