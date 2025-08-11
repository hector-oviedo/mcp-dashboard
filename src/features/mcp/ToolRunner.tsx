// /src/features/mcp/ToolRunner.tsx
// Collapsible description + collapsible params with prefilled examples
"use client";
import * as React from "react";
import type { ToolDef } from "@/domain/mcpClient";
import { McpConnector } from "@/domain/mcpClient";
import { Collapsible } from "@/components/ui/Collapsible";
import { JsonPretty } from "@/components/ui/JsonPretty";
import { ToolArgsForm } from "./ToolArgsForm";
import { cn } from "@/lib/utils";

function coerce(type: string | undefined, raw: string): unknown {
  if (raw === "") return undefined;
  if (type === "number" || type === "integer") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  if (type === "boolean") {
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
    return raw;
  }
  if (type === "array" || type === "object") {
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return raw;
}

function stringifyIfNeeded(v: any): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function defaultsFromSchema(t: ToolDef): Record<string, string> {
  const props = t.inputSchema?.properties || {};
  const out: Record<string, string> = {};
  for (const [k, meta] of Object.entries<any>(props)) {
    const c = meta as { default?: any; example?: any; examples?: any[]; enum?: any[]; type?: string };
    let val: any = undefined;
    if (c.example !== undefined) val = c.example;
    else if (Array.isArray(c.examples) && c.examples.length) val = c.examples[0];
    else if (c.default !== undefined) val = c.default;
    else if (Array.isArray(c.enum) && c.enum.length) val = c.enum[0];
    out[k] = stringifyIfNeeded(val);
  }
  return out;
}

export function ToolRunner({ client, tools }: { client: McpConnector; tools: ToolDef[] }) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<Record<string, unknown>>({});
  const [argsMap, setArgsMap] = React.useState<Record<string, Record<string, string>>>(() => ({}));
  const [errors, setErrors] = React.useState<Record<string, string | null>>({});

  // Initialize defaults once per tool
  React.useEffect(() => {
    setArgsMap((prev) => {
      const next = { ...prev };
      for (const t of tools) {
        if (!next[t.name]) next[t.name] = defaultsFromSchema(t);
      }
      return next;
    });
  }, [tools]);

  function setArg(tool: string, key: string, value: string) {
    setArgsMap((m) => ({ ...m, [tool]: { ...(m[tool] || {}), [key]: value } }));
  }

  async function runTool(t: ToolDef) {
    try {
      setBusy(t.name);
      setErrors((e) => ({ ...e, [t.name]: null }));

      const props: any = t.inputSchema?.properties || {};
      const requiredSet = new Set(t.inputSchema?.required || []);
      const current = argsMap[t.name] || {};
      const argObj: Record<string, unknown> = {};

      for (const key of Object.keys(props)) {
        const raw = current[key] ?? "";
        const coerced = coerce(props[key]?.type, raw);
        const isMissing = coerced === undefined;
        if (isMissing) {
          if (requiredSet.has(key)) throw new Error(`Missing required argument: ${key}`);
          continue; // skip optional empties
        }
        argObj[key] = coerced;
      }

      const res = await client.callTool(t.name, argObj);
      setResults((r) => ({ ...r, [t.name]: res }));
    } catch (e: any) {
      const msg = e?.message || String(e);
      setErrors((er) => ({ ...er, [t.name]: msg }));
      setResults((r) => ({ ...r, [t.name]: { error: msg } }));
    } finally {
      setBusy(null);
    }
  }

  if (!tools?.length) return <p className="text-sm text-muted-foreground">No tools.</p>;

  return (
    <div className="space-y-5">
      {tools.map((t) => {
        const props: any = t.inputSchema?.properties || {};
        const required = t.inputSchema?.required || [];
        const vals = argsMap[t.name] || {};
        const isBusy = busy === t.name;

        return (
          <div key={t.name} className={cn("border border-border bg-secondary p-3 rounded-none")}>
            <div className="mb-2 text-sm font-medium text-center">{t.title || t.name}</div>

            <Collapsible title="Description">
              {t.description || "(No description)"}
            </Collapsible>

            <Collapsible title="Run Tool Form">
              <ToolArgsForm
                properties={props}
                required={required}
                values={vals}
                onChange={(k, v) => setArg(t.name, k, v)}
                onRun={() => runTool(t)}
                busy={isBusy}
              />
              {errors[t.name] ? (
                <div className="mt-2 text-xs text-destructive text-center">{errors[t.name]}</div>
              ) : null}
            </Collapsible>

            {/* Result */}
            {results[t.name] && (
              <div className="mt-3">
                <JsonPretty value={results[t.name]} expand={2} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}