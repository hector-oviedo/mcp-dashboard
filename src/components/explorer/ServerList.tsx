/** /src/components/explorer/ServerList.tsx
 * Grid list of servers with responsive columns.
 */
"use client";
import type { McpServer } from "@/domain/mcp";
import { ServerItem } from "./ServerItem";

export function ServerList({ servers }: { servers: McpServer[] }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {servers.map((s) => (
        <ServerItem key={s.id ?? `${s.url || s.name}:${s.package_name || ""}`} s={s} />
      ))}
    </div>
  );
}