// /src/components/explorer/StatusTable.tsx
"use client";
import { cn } from "@/lib/utils";
import { CodeCopy } from "@/components/ui/CodeCopy";

export function StatusTable({
  title,
  items, // [{label, value, copyText?}]
  className,
}: {
  title: string;
  items: { label: string; value: string; copyText?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("border border-border", className)}>
      <div className="flex items-center justify-center px-3 py-2 text-xs font-medium">
        {title}
      </div>
      <div className="relative h-px">
        <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
      </div>
      <div className="grid grid-cols-2">
        {items.map((it, idx) => {
          const display = it.value && it.value.trim() ? it.value : "N/A";
          const copyVal = it.copyText ?? display;
          return (
            <div
              key={`${it.label}-${idx}`}
              className="flex flex-col items-stretch justify-center gap-1 px-3 py-3 text-center"
            >
              <div className="text-[11px] text-muted-foreground">{it.label}</div>
              <CodeCopy value={copyVal} displayValue={display} />
            </div>
          );
        })}
      </div>
    </div>
  );
}