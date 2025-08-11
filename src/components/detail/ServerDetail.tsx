// /src/components/detail/ServerDetail
"use client";
import type { McpServer, McpRemote } from "@/domain/mcp";
import { McpServerFilter } from "@/domain/mcp";
import { WidgetCard } from "@/components/layout/WidgetCard";
import { StatusTable } from "@/components/explorer/StatusTable";
import { CodeCopy } from "@/components/ui/CodeCopy";
import { JsonPretty } from "@/components/ui/JsonPretty";

function pickRemote(s: McpServer, want: "http" | "sse"): McpRemote | undefined {
  const rem = s.remotes ?? [];
  if (want === "http")
    return rem.find((r) => ["streamable_http", "streamable_http_and_sse"].includes((r.transport || "").toLowerCase()));
  return rem.find((r) => ["sse", "streamable_http_and_sse"].includes((r.transport || "").toLowerCase()));
}

export function ServerDetail({ s }: { s: McpServer }) {
  const http = McpServerFilter.hasHTTP(s);
  const sse = McpServerFilter.hasSSE(s);
  const httpR = pickRemote(s, "http");
  const sseR = pickRemote(s, "sse");
  const httpAuth = httpR?.authentication_method || (http ? "unknown" : "N/A");
  const sseAuth  = sseR?.authentication_method  || (sse  ? "unknown" : "N/A");
  const isNpm = McpServerFilter.isNpm(s);
  const isPy = !isNpm && !!s.package_registry;

  return (
    <div className="grid gap-6">
      {/* Overview */}
      <WidgetCard>
        <h2 className="mb-3 text-center text-base font-semibold">{s.name}</h2>

        <div className="grid gap-3">
          <StatusTable
            title="Transport"
            items={[
              { label: "HTTP",       value: http ? (httpR?.url_direct || httpR?.url_setup || "Available") : "N/A", copyText: http ? (httpR?.url_direct || httpR?.url_setup || "") : "" },
              { label: "Auth",  value: httpAuth, copyText: httpAuth !== "N/A" ? httpAuth : "" },
              { label: "SSE",        value: sse ? (sseR?.url_direct || sseR?.url_setup || "Available") : "N/A",   copyText: sse ? (sseR?.url_direct || sseR?.url_setup || "") : "" },
              { label: "Auth",   value: sseAuth, copyText: sseAuth !== "N/A" ? sseAuth : "" },
            ]}
          />
          <StatusTable
            title="Package"
            items={[
              { label: "NPM",    value: isNpm ? (s.package_name || "Available") : "N/A", copyText: isNpm ? (s.package_name || "N/A") : "N/A" },
              { label: "Python", value: isPy ? (s.package_name || "Available") : "N/A", copyText: isPy ? (s.package_name || "N/A") : "N/A" },
            ]}
          />
        </div>

        <div className="mt-3 border border-border">
          <div className="flex items-center justify-center bg-secondary px-3 py-2 text-xs font-medium">Description</div>
          <div className="relative h-px">
            <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
          </div>
          <div className="px-3 py-3 text-sm">{s.short_description ?? "No description."}</div>
        </div>

        <div className="mt-3 border border-border">
          <div className="flex items-center justify-center bg-secondary px-3 py-2 text-xs font-medium">AI Description</div>
          <div className="relative h-px">
            <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
          </div>
          <div className="px-3 py-3 text-sm">{s.EXPERIMENTAL_ai_generated_description ?? "No AI description."}</div>
        </div>

        <div className="mt-4 flex justify-center">
          {s.source_code_url ? (
            <a href={s.source_code_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--fx-1)] underline underline-offset-4 decoration-[var(--fx-1)] hover:text-[var(--fx-2)] hover:decoration-[var(--fx-2)]">
              View source
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Source: N/A</span>
          )}
        </div>
      </WidgetCard>
    </div>
  );
}