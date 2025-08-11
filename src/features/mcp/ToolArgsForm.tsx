// /src/features/mcp/ToolArgsForm.tsx
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SchemaProp = {
  type?: string;
  description?: string;
  enum?: any[];
  example?: any;
  examples?: any[];
  default?: any;
};

export function ToolArgsForm({
  properties = {},
  required = [],
  values,
  onChange,
  onRun,
  busy,
}: {
  properties?: Record<string, SchemaProp>;
  required?: string[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onRun: () => void;
  busy?: boolean;
}) {
  const req = new Set(required);

  return (
    <div className="grid gap-3">
      {Object.keys(properties).length === 0 ? (
        <div className="text-xs text-muted-foreground">(No arguments)</div>
      ) : (
        Object.entries(properties).map(([k, meta]) => {
          const placeholder = meta.description || meta.type || "value";
          const val = values[k] ?? "";
          return (
            <div key={k} className="grid gap-1">
              <Label className="text-xs">{k}{req.has(k) ? " *" : ""}</Label>
              <Input
                className="rounded-none"
                placeholder={placeholder}
                value={val}
                onChange={(e) => onChange(k, e.target.value)}
              />
              <div className="text-[10px] text-muted-foreground">{meta.type || "string"}</div>
            </div>
          );
        })
      )}

      <div className="pt-1 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          className="rounded-none"
          disabled={!!busy}
          onClick={onRun}
        >
          {busy ? "Running…" : "Run tool"}
        </Button>
      </div>
    </div>
  );
}
