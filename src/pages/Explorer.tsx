// /src/pages/Explorer.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { WidgetCard } from "@/components/layout/WidgetCard";
import type { UIFilters } from "@/components/explorer/ServerFilters";
import { ServerFilters } from "@/components/explorer/ServerFilters";
import { ServerList } from "@/components/explorer/ServerList";
import type { McpServer } from "@/domain/mcp";
import { matchesServer } from "@/domain/mcp";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { fetchAllServers } from "@/domain/mcp_api";

const BATCH = 20;

export default function Explorer() {
  // Default: everything ON
  const [draft, setDraft] = useState<UIFilters>({
    filtersEnabled: true,

    name: "", description: "",
    hasHTTP: true, hasSSE: true,

    httpAuthMode: "all",
    sseAuthMode: "all",
    httpAuth: ["open","oauth","api_key"],
    sseAuth:  ["open","oauth","api_key"],

    hasNpm: true, hasPython: true,
  });
  const [active, setActive] = useState<UIFilters>(draft);

  const [all, setAll] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [visible, setVisible] = useState(BATCH);

  const loadAll = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const data = await fetchAllServers();
      setAll(data);
      setVisible(BATCH);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const apply = useCallback(() => {
    setActive(draft);
    setVisible(BATCH);
  }, [draft]);

  const filtered = useMemo(
    () => all.filter(s => matchesServer(s, {
      filtersEnabled: active.filtersEnabled,
      name: active.name,
      description: active.description,
      hasHTTP: active.hasHTTP,
      hasSSE: active.hasSSE,
      httpAuthMode: active.httpAuthMode,
      sseAuthMode: active.sseAuthMode,
      httpAuth: active.httpAuth,
      sseAuth: active.sseAuth,
      hasNpm: active.hasNpm,
      hasPython: active.hasPython,
    })),
    [all, active]
  );

  const canLoadMore = visible < filtered.length;
  const sentinelRef = useInfiniteScroll(
    () => setVisible(v => Math.min(v + BATCH, filtered.length)),
    canLoadMore
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="Explorer" showThemeToggle />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-6">
        <WidgetCard className="mb-6">
          <h2 className="mb-4 text-center text-base font-medium">MCP Explorer</h2>
          <ServerFilters value={draft} onChange={(n)=>setDraft(f=>({ ...f, ...n }))} onApply={apply} />
        </WidgetCard>

        {err ? (
          <WidgetCard className="mb-6">
            <p className="text-sm text-destructive">Error: {err}</p>
          </WidgetCard>
        ) : null}

        <ServerList servers={filtered.slice(0, visible)} />

        <div ref={sentinelRef} className="h-12" />
        {loading ? <div className="mt-4 text-center text-xs text-muted-foreground">Loading…</div> : null}
      </main>
    </div>
  );
}