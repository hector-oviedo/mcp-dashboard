// /src/pages/Blueprint.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { WidgetCard } from "@/components/layout/WidgetCard";
import { ServerDetail } from "@/components/detail/ServerDetail";
import type { McpServer } from "@/domain/mcp";
import { fetchAllServers } from "@/domain/mcp_api";
import { ConnectorPanel } from "@/features/mcp/ConnectorPanel";

export default function Blueprint() {
  const q = new URLSearchParams(useLocation().search);
  const id = q.get("id") || "";
  const [all, setAll] = useState<McpServer[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAllServers().then(
      (s) => mounted && setAll(s),
      (e) => mounted && setErr(e?.message ?? "Failed to load")
    );
    return () => { mounted = false; };
  }, []);

  const s = useMemo(() => {
    const list = all || [];
    if (id) return list.find(x => (x.id || "") === id);
    return undefined;
  }, [all, id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title={s?.name || "MCP"} backTo="/explorer" />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-6">
        {!all && !err ? <WidgetCard><div className="text-center text-xs text-muted-foreground">Loading…</div></WidgetCard> : null}
        {err ? <WidgetCard><div className="text-sm text-destructive">Error: {err}</div></WidgetCard> : null}
        {!s && all ? <WidgetCard><div className="text-sm">Server not found.</div></WidgetCard> : null}
        { s ? (
          <div className="space-y-6">
            <ServerDetail s={s} />
            <ConnectorPanel server={s} />
          </div>
        ) : null }
      </main>
    </div>
  );
}