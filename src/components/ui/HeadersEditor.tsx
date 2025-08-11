// =============================
// /src/components/ui/HeadersEditor.tsx
// Small Postman‑style header editor (square, full‑width).
// =============================
// /src/components/ui/HeadersEditor.tsx
// /src/components/ui/HeadersEditor.tsx
"use client";
import * as React from "react";
export type HeaderPair = { key: string; value: string };

export function HeadersEditor({
  value,
  onChange,
  compact,
}: { value: HeaderPair[]; onChange: (v: HeaderPair[]) => void; compact?: boolean }) {
  const rows = value ?? [];
  const add = () => onChange([...rows, { key: "", value: "" }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<HeaderPair>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const cellClass = "border border-border px-2 text-sm text-center rounded-none h-9";

  return (
    <div className={compact ? "" : "border border-border p-3"}>
      <div className="grid grid-cols-[1fr_1fr_auto] items-center mb-2 gap-2">
        <div className="text-xs text-center">Header</div>
        <div className="text-xs text-center">Value</div>
        <div className="flex justify-center">
          <button type="button" onClick={add} className="h-9 w-9 border border-border text-sm leading-none">+</button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <input
              className={cellClass}
              placeholder="Authorization"
              value={r.key}
              onChange={(e) => update(i, { key: e.target.value })}
            />
            <input
              className={cellClass}
              placeholder="Bearer …"
              value={r.value}
              onChange={(e) => update(i, { value: e.target.value })}
            />
            <div className="flex justify-center">
              <button type="button" onClick={() => remove(i)} className="h-9 w-9 border border-border text-sm leading-none">−</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}