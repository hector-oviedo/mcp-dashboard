// /src/domain/mcp_api.ts
// Canonical API access + stable index IDs
import type { McpListResponse, McpServer } from "./mcp";

const BASE = "https://api.pulsemcp.com/v0beta";

/**
 * Fetch all servers following pagination.
 * Use large page size to minimize round-trips.
 */
export async function fetchAllServers(): Promise<McpServer[]> {
  const acc: McpServer[] = [];
  let url = `${BASE}/servers`;
  for (;;) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data: McpListResponse = await res.json();
    acc.push(...(data.servers || []));
    if (!data.next) break;
    url = data.next!;
  }
  // Stable synthetic ids: index-based
  return acc.map((s, i) => ({ ...s, id: `idx-${i}` }));
}