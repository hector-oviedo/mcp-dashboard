// /src/components/explorer/ServerFilters.tsx
"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/Collapsible";
import { cn } from "@/lib/utils";
import type { AuthKind, AuthMode } from "@/domain/mcp";

export type UIFilters = {
  filtersEnabled: boolean;

  name: string;
  description: string;

  hasHTTP: boolean;
  hasSSE: boolean;

  httpAuthMode: AuthMode;
  sseAuthMode: AuthMode;

  httpAuth: AuthKind[];   // when mode = "specific"
  sseAuth: AuthKind[];

  hasNpm: boolean;
  hasPython: boolean;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="flex items-center justify-center bg-secondary px-3 py-2 text-xs font-medium">{title}</div>
      <div className="relative h-px">
        <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function AuthModeSelector({
  mode, onMode, kinds, onKinds, disabled, prefixId,
}: {
  mode: AuthMode;
  onMode: (m: AuthMode) => void;
  kinds: AuthKind[];
  onKinds: (ks: AuthKind[]) => void;
  disabled?: boolean;
  prefixId: string;
}) {
  const toggleKind = (k: AuthKind) =>
    onKinds(kinds.includes(k) ? kinds.filter(x => x !== k) : [...kinds, k]);

  return (
    <div className={cn("grid gap-2", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-4 text-xs">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`${prefixId}-authmode`}
            checked={mode === "all"}
            onChange={() => onMode("all")}
          />
          All auths
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`${prefixId}-authmode`}
            checked={mode === "specific"}
            onChange={() => onMode("specific")}
          />
          Enable specific
        </label>
      </div>
      {mode === "specific" && (
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox id={`${prefixId}-open`}  label="open"    checked={kinds.includes("open")}    onChange={()=>toggleKind("open")} />
          <Checkbox id={`${prefixId}-oauth`} label="oauth"   checked={kinds.includes("oauth")}   onChange={()=>toggleKind("oauth")} />
          <Checkbox id={`${prefixId}-api`}   label="api_key" checked={kinds.includes("api_key")} onChange={()=>toggleKind("api_key")} />
        </div>
      )}
    </div>
  );
}

export function ServerFilters({
  value, onChange, onApply, className,
}: {
  value: UIFilters;
  onChange: (next: Partial<UIFilters>) => void;
  onApply: () => void;
  className?: string;
}) {
  const onEnterApply = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onApply();
  };

  const disabled = !value.filtersEnabled;

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="nameq">Name</Label>
        <Input
          id="nameq"
          placeholder="Search by name…"
          value={value.name}
          onChange={(e)=>onChange({name:e.target.value})}
          onKeyDown={onEnterApply}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="descq">Description</Label>
        <Input
          id="descq"
          placeholder="Search in description…"
          value={value.description}
          onChange={(e)=>onChange({description:e.target.value})}
          onKeyDown={onEnterApply}
        />
      </div>

      <Collapsible title="Filters">
        <div className="mb-3 flex items-center justify-center gap-4">
          <Checkbox
            id="f-enabled"
            label="Enable filters"
            checked={value.filtersEnabled}
            onChange={(v)=>onChange({filtersEnabled: v})}
          />
        </div>

        <Group title="Transport & Authentication">
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", disabled && "opacity-50 pointer-events-none")}>
            {/* HTTP */}
            <div className="border border-border p-3">
              <div className="flex items-center justify-between">
                <Checkbox
                  id="f-http"
                  label="HTTP"
                  checked={value.hasHTTP}
                  onChange={(v)=>onChange({hasHTTP:v})}
                />
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Auth:</div>
              <AuthModeSelector
                mode={value.httpAuthMode}
                onMode={(m)=>onChange({httpAuthMode: m})}
                kinds={value.httpAuth}
                onKinds={(ks)=>onChange({httpAuth: ks})}
                disabled={disabled || !value.hasHTTP}
                prefixId="http"
              />
            </div>

            {/* SSE */}
            <div className="border border-border p-3">
              <div className="flex items-center justify-between">
                <Checkbox
                  id="f-sse"
                  label="SSE"
                  checked={value.hasSSE}
                  onChange={(v)=>onChange({hasSSE:v})}
                />
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Auth:</div>
              <AuthModeSelector
                mode={value.sseAuthMode}
                onMode={(m)=>onChange({sseAuthMode: m})}
                kinds={value.sseAuth}
                onKinds={(ks)=>onChange({sseAuth: ks})}
                disabled={disabled || !value.hasSSE}
                prefixId="sse"
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Tip: “All auths” ignores auth type. “Enable specific” includes only selected auths.
          </div>
        </Group>

        <Group title="Package">
          <div className={cn("flex flex-wrap items-center justify-center gap-6", disabled && "opacity-50 pointer-events-none")}>
            <Checkbox id="f-npm" label="NPM"    checked={value.hasNpm}    onChange={(v)=>onChange({hasNpm:v})}/>
            <Checkbox id="f-py"  label="Python" checked={value.hasPython} onChange={(v)=>onChange({hasPython:v})}/>
          </div>
        </Group>

        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={onApply}>Apply</Button>
        </div>
      </Collapsible>
    </div>
  );
}