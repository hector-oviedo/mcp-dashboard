// =============================
// /src/domain/mcpClient.ts
// Lightweight wrapper around @modelcontextprotocol/sdk client
// to support HTTP + SSE transports with optional custom headers.
// Includes a concise map of the core JSON-RPC methods we can call.
// =============================
// =============================
// /src/domain/mcpClient.ts
// Robust MCP client wrapper (HTTP + SSE with header preservation & fallback)
// =============================
"use client";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export type McpProtocol = "http" | "sse";

export type ToolDef = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, { type?: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
};

export type McpServerInfo = {
  protocolVersion?: string;
  capabilities?: unknown;
  serverVersion?: string;
  instructions?: unknown;
};

function withExtraHeaders(extra: Record<string, string>) {
  // Merge our extra headers without dropping existing ones (incl. Content-Type).
  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const baseReq = input instanceof Request ? input : undefined;
    const merged = new Headers(baseReq?.headers || init.headers || undefined);
    for (const [k, v] of Object.entries(extra || {})) merged.set(k, v);
    return fetch(input as any, { ...init, headers: merged });
  };
}

export class McpConnector {
  private client?: Client;
  private transport?: any;

  async connect(url: string, protocol: McpProtocol, headers: Record<string, string> = {}) {
    await this.close();

    const base = new URL(url);
    const client = new Client({ name: "mcp-ui-client", version: "1.0.0" });

    const connectHttp = async () => {
      const t = new StreamableHTTPClientTransport(base, { fetch: withExtraHeaders(headers) } as any);
      await client.connect(t);
      this.transport = t;
    };

    const connectSse = async () => {
      const t = new SSEClientTransport(base, { fetch: withExtraHeaders(headers) } as any);
      await client.connect(t);
      this.transport = t;
    };

    try {
      if (protocol === "http") {
        try {
          await connectHttp();
        } catch (e: any) {
          const msg = String(e?.message || e);
          // Servers like deepwiki return 405/501 for streamable-http handshake → fall back to SSE.
          if (msg.includes("405") || msg.includes("501") || msg.includes("Method Not Allowed")) {
            await connectSse();
          } else {
            throw e;
          }
        }
      } else {
        await connectSse();
      }
    } catch (e) {
      try { await client.close(); } catch {}
      throw e;
    }

    this.client = client;
  }

  async close() {
    if (this.client) { try { await this.client.close(); } catch {} this.client = undefined; }
    if (this.transport?.close) { try { await this.transport.close(); } catch {} }
    this.transport = undefined;
  }

  private ensure(): Client {
    if (!this.client) throw new Error("Not connected");
    return this.client;
  }

  getServerInfo(): McpServerInfo {
    const c: any = this.ensure();
    return {
      protocolVersion: c.getServerCapabilities?.()?.protocolVersion,
      capabilities: c.getServerCapabilities?.(),
      serverVersion: c.getServerVersion?.(),
      instructions: c.getInstructions?.(),
    };
  }

  async listTools(): Promise<ToolDef[]> {
    const res = await this.ensure().listTools();
    return res?.tools ?? [];
  }

  async callTool(name: string, args: Record<string, unknown> = {}) {
    return await (this.ensure() as any).callTool({ name, arguments: args });
  }

  async request(method: string, params?: any) {
    // Important: pass (method, params) — not an object.
    return await (this.ensure() as any).request(method, params);
  }
}


/**
 * MCP JSON-RPC surface (server methods you can call):
 * - tools/list → { tools: Tool[] }
 * - tools/call { name, arguments } → { content: Content[] }
 * - resources/list → direct resources
 * - resources/templates/list → resource templates
 * - resources/read { uri } → resource content
 * - prompts/list → prompt descriptors
 * - prompts/get { name } → prompt with arguments
 *
 * Notifications you may receive (no response):
 * - notifications/tools/list_changed, roots/list_changed, etc.
 *
 * Client-exposed features (server may call *you*): sampling/complete, elicitation/request, logging.
 */