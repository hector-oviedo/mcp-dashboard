/** /src/components/explorer/ServerItem.tsx
 * Clean pickRemote + stable index id routing
 */
"use client";
import { WidgetCard } from "@/components/layout/WidgetCard";
import { Collapsible } from "@/components/ui/Collapsible";
import { Button } from "@/components/ui/button";
import type { McpServer, McpRemote } from "@/domain/mcp";
import { McpServerFilter } from "@/domain/mcp";
import { Link } from "react-router-dom";
import { IconFileCode, IconRobot, IconExternalLink } from "@tabler/icons-react";
import { StatusTable } from "./StatusTable";

function pickRemote(s: McpServer, want: "http" | "sse"): McpRemote | undefined {
  const rem = s.remotes ?? [];
  if (want === "http")
    return rem.find(r => {
      const t = (r.transport || "").toLowerCase();
      return t.includes("streamable_http");
    });
  return rem.find(r => {
    const t = (r.transport || "").toLowerCase();
    return t === "sse" || t.includes("streamable_http_and_sse");
  });
}

export function ServerItem({ s }: { s: McpServer }) {
  const serverId = s.id ?? ""; // index-based id assigned in api layer
  const httpYes = McpServerFilter.hasHTTP(s);
  const sseYes  = McpServerFilter.hasSSE(s);
  const httpRemote = pickRemote(s, "http");
  const sseRemote  = pickRemote(s, "sse");
  const httpCopy   = httpRemote?.url_direct || httpRemote?.url_setup || (httpYes ? "streamable_http" : "");
  const sseCopy    = sseRemote?.url_direct || sseRemote?.url_setup  || (sseYes  ? "sse" : "");
  const isNpm      = McpServerFilter.isNpm(s);
  const isPython   = McpServerFilter.isPython(s);
  const pkgValNpm  = isNpm    ? (s.package_name || "Available") : "N/A";
  const pkgValPy   = isPython ? (s.package_name || "Available") : "N/A";

  return (
    <WidgetCard>
      <h3 className="mb-3 text-center text-sm font-medium">{s.name}</h3>

      <div className="grid gap-3">
        <StatusTable
          title="Transport"
          items={[
            { label: "HTTP", value: httpYes ? (httpRemote?.url_direct || httpRemote?.url_setup || "Available") : "N/A", copyText: httpYes ? httpCopy : undefined },
            { label: "SSE",  value: sseYes  ? (sseRemote?.url_direct  || sseRemote?.url_setup  || "Available") : "N/A",  copyText: sseYes  ? sseCopy  : undefined },
          ]}
        />
        <StatusTable
          title="Package"
          items={[
            { label: "NPM",    value: pkgValNpm, copyText: isNpm ? s.package_name || undefined : undefined },
            { label: "Python", value: pkgValPy,  copyText: isPython ? s.package_name || undefined : undefined },
          ]}
        />
      </div>

      <div className="mt-3 grid gap-3">
        <div className="border border-border">
          <div className="flex items-center justify-center bg-secondary px-3 py-2 text-xs font-medium">
            Description
          </div>
          <div className="relative h-px">
            <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
          </div>
          <div className="px-3 py-3 text-sm">{s.short_description ?? "No description."}</div>
        </div>
        <Collapsible title="AI Description">
          {s.EXPERIMENTAL_ai_generated_description ?? "No AI description."}
        </Collapsible>
      </div>

      <div className="mt-4 flex justify-center">
        {s.source_code_url ? (
          <a
            href={s.source_code_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--fx-1)] underline underline-offset-4 decoration-[var(--fx-1)] hover:text-[var(--fx-2)] hover:decoration-[var(--fx-2)]"
          >
            <IconExternalLink size={14} />
            {s.source_code_url}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Source: N/A</span>
        )}
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-2">
        <Link to={`/blueprint?id=${encodeURIComponent(serverId)}`}>
          <Button variant="secondary" leftIcon={<IconFileCode size={16} />}>Blueprint</Button>
        </Link>
        <Link to={`/agent?id=${encodeURIComponent(serverId)}`}>
          <Button variant="secondary" leftIcon={<IconRobot size={16} />}>Agentic</Button>
        </Link>
      </div>
    </WidgetCard>
  );
}