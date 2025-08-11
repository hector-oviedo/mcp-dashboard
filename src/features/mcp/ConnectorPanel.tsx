// /src/features/mcp/ConnectorPanel.tsx
// Hide unsupported widgets; keep concise capability cards
"use client";
import * as React from "react";
import type { McpProtocol } from "@/domain/mcpClient";
import { McpConnector } from "@/domain/mcpClient";
import type { HeaderPair } from "@/components/ui/HeadersEditor";
import { HeadersEditor } from "@/components/ui/HeadersEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JsonPretty } from "@/components/ui/JsonPretty";
import { ToolRunner } from "@/features/mcp/ToolRunner";
import { WidgetCard } from "@/components/layout/WidgetCard";
import { cn } from "@/lib/utils";
import type { McpServer } from "@/domain/mcp";

type Avail = { proto: McpProtocol; url: string };

function deriveAvailable(server?: McpServer): Avail[] {
  if (!server?.remotes) return [];
  const out: Avail[] = [];
  for (const r of server.remotes) {
    const t = (r.transport || "").toLowerCase();
    const url = r.url_direct || "";
    if (!url) continue;
    if (t.includes("streamable_http")) out.push({ proto: "http", url });
    if (t === "sse" || t.includes("streamable_http_and_sse")) out.push({ proto: "sse", url });
  }
  const seen = new Set<string>();
  return out.filter(a => (seen.has(a.proto) ? false : (seen.add(a.proto), true)));
}

export function ConnectorPanel({ server, className }: { server?: McpServer; className?: string }) {
  const avail = React.useMemo(() => deriveAvailable(server), [server]);

  const [proto, setProto] = React.useState<McpProtocol>("http");
  const [url, setUrl] = React.useState("");
  const [headers, setHeaders] = React.useState<HeaderPair[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<any>(null);
  const [caps, setCaps] = React.useState<any>(null);
  const [tools, setTools] = React.useState<any[]>([]);
  const [lastRoots, setLastRoots] = React.useState<any>(null);
  const [lastResources, setLastResources] = React.useState<any>(null);
  const [lastPrompts, setLastPrompts] = React.useState<any>(null);

  const clientRef = React.useRef(new McpConnector());

  React.useEffect(() => {
    if (avail.length === 0) return;
    setProto(avail[0].proto);
    setUrl(avail[0].url);
  }, [avail]);

  function headerObject(): Record<string, string> {
    const o: Record<string, string> = {};
    headers.forEach(({ key, value }) => { const k = key.trim(); if (k) o[k] = value; });
    return o;
  }

  async function connect() {
    setBusy(true); setErr(null);
    setInfo(null); setCaps(null);
    setTools([]);
    setLastRoots(null); setLastResources(null); setLastPrompts(null);
    try {
      await clientRef.current.connect(url, proto, headerObject());
      const i = clientRef.current.getServerInfo();
      setInfo(i);
      setCaps(i?.capabilities ?? null);

      const t = await clientRef.current.listTools();
      // accept { tools: [...] } or [...]
      // @ts-ignore
      setTools(Array.isArray(t) ? t : (t?.tools ?? []));
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => () => { clientRef.current.close(); }, []);
  if (avail.length === 0) return null;

  const protoChoices = avail.map(a => a.proto);
  const onProtoChange = (p: McpProtocol) => {
    setProto(p);
    const m = avail.find(a => a.proto === p);
    if (m) setUrl(m.url);
  };

  const hasTools = !!caps?.tools;
  const hasRoots = !!caps?.roots;
  const hasResources = !!caps?.resources;
  const hasPrompts = !!caps?.prompts;

  const listRoots = async () => {
    try {
      setBusy(true); setErr(null);
      const res = await (clientRef.current as any).request("roots/list", {});
      setLastRoots(res);
    } catch (e: any) { setErr(e?.message || String(e)); }
    finally { setBusy(false); }
  };
  const listResources = async () => {
    try {
      setBusy(true); setErr(null);
      const res = await (clientRef.current as any).request("resources/list", {});
      setLastResources(res);
    } catch (e: any) { setErr(e?.message || String(e)); }
    finally { setBusy(false); }
  };
  const listPrompts = async () => {
    try {
      setBusy(true); setErr(null);
      const res = await (clientRef.current as any).request("prompts/list", {});
      setLastPrompts(res);
    } catch (e: any) { setErr(e?.message || String(e)); }
    finally { setBusy(false); }
  };

  const Pill = ({ on }: { on: boolean }) => (
    <span className={cn(
      "inline-flex h-5 min-w-14 items-center justify-center rounded-full px-2 text-xs font-medium",
      on ? "bg-emerald-600/15 text-emerald-500" : "bg-destructive/15 text-destructive"
    )}>
      {on ? "on" : "off"}
    </span>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <WidgetCard>
        <div className="grid gap-4">
          {/* URL + transport */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="md:col-span-10">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-mcp-endpoint"
                className="rounded-none text-center h-9"
              />
            </div>
            <div className="md:col-span-2 relative">
              {protoChoices.length > 1 ? (
                <>
                  <select
                    value={proto}
                    onChange={(e) => onProtoChange(e.target.value as McpProtocol)}
                    className="h-9 w-full border border-border bg-secondary pl-2 pr-10 text-sm rounded-none appearance-none text-center"
                  >
                    {protoChoices.includes("http") && <option value="http">HTTP</option>}
                    {protoChoices.includes("sse") && <option value="sse">SSE</option>}
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 opacity-70" viewBox="0 0 20 20">
                    <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </>
              ) : (
                <div className="h-9 w-full border border-border bg-secondary px-2 text-sm rounded-none flex items-center justify-center">
                  {protoChoices[0] === "sse" ? "SSE" : "HTTP"}
                </div>
              )}
            </div>
          </div>

          {/* Headers */}
          <div className="border border-border">
            <div className="flex items-center justify-center bg-secondary px-3 py-2 text-xs font-medium">Headers</div>
            <div className="relative h-px">
              <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
            </div>
            <div className="p-3">
              <HeadersEditor value={headers} onChange={setHeaders} compact />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button type="button" variant="secondary" onClick={connect} className="rounded-none min-w-32">
              {busy ? "Connecting…" : "Connect"}
            </Button>
            {err && <div className="text-xs text-destructive self-center">{err}</div>}
          </div>
        </div>
      </WidgetCard>

      {info && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-3">Server Info</div>
          <JsonPretty value={info} expand={2} />
        </WidgetCard>
      )}

      {caps && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-3">Capabilities</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>tools</span><Pill on={!!caps?.tools} />
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>roots</span><Pill on={!!caps?.roots} />
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>resources</span><Pill on={!!caps?.resources} />
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>prompts</span><Pill on={!!caps?.prompts} />
            </div>
          </div>
        </WidgetCard>
      )}

      {/* Show widgets only if supported */}
      {hasTools && tools.length > 0 && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-4">Tools</div>
          <ToolRunner client={clientRef.current} tools={tools} />
        </WidgetCard>
      )}

      {hasRoots && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-3">Roots</div>
          <div className="flex justify-center mb-3">
            <Button variant="secondary" className="rounded-none" onClick={listRoots} disabled={busy}>
              roots/list
            </Button>
          </div>
          {lastRoots && <JsonPretty value={lastRoots} expand={2} />}
        </WidgetCard>
      )}

      {hasResources && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-3">Resources</div>
          <div className="flex justify-center mb-3">
            <Button variant="secondary" className="rounded-none" onClick={listResources} disabled={busy}>
              resources/list
            </Button>
          </div>
          {lastResources && <JsonPretty value={lastResources} expand={2} />}
        </WidgetCard>
      )}

      {hasPrompts && (
        <WidgetCard>
          <div className="text-sm font-medium text-center mb-3">Prompts</div>
          <div className="flex justify-center mb-3">
            <Button variant="secondary" className="rounded-none" onClick={listPrompts} disabled={busy}>
              prompts/list
            </Button>
          </div>
          {lastPrompts && <JsonPretty value={lastPrompts} expand={2} />}
        </WidgetCard>
      )}
    </div>
  );
}
