// /src/domain/mcp.ts
// Types + robust filters (independent groups; OR-combined)

export type McpRemote = {
  transport?: string;
  url_direct?: string | null;
  url_setup?: string | null;
  authentication_method?: string | null; // "open" | "oauth" | "api_key" | null/unknown
  cost?: string | null;
};

export type McpServer = {
  id?: string;                        // synthetic
  name?: string;
  url?: string | null;                // canonical details URL
  external_url?: string | null;

  short_description?: string | null;
  EXPERIMENTAL_ai_generated_description?: string | null;

  remotes?: McpRemote[];

  // packaging
  package_registry?: string | null;   // "npm" | "pypi" | etc.
  package_name?: string | null;
  package_download_count?: number | null;

  // misc
  source_code_url?: string | null;
  github_stars?: number | null;
};

export type McpListResponse = {
  servers?: McpServer[];
  total_count?: number;
  next?: string | null;
};

// ---- filters (used by Explorer) ----
export type AuthKind = "open" | "oauth" | "api_key";
export type AuthMode = "all" | "specific";

export type FilterOpts = {
  // master switch
  filtersEnabled?: boolean;

  // free-text
  name?: string;
  description?: string;

  // transports
  hasHTTP?: boolean;
  hasSSE?: boolean;

  // per-transport auth modes
  httpAuthMode?: AuthMode;
  sseAuthMode?: AuthMode;

  // when mode = specific
  httpAuth?: AuthKind[];
  sseAuth?: AuthKind[];

  // packages
  hasNpm?: boolean;
  hasPython?: boolean;
};

function norm(s?: string | null) { return (s || "").toLowerCase(); }
function transportIsHttp(t?: string | null) {
  const x = norm(t);
  return x.includes("streamable_http"); // matches streamable_http and streamable_http_and_sse
}
function transportIsSse(t?: string | null) {
  const x = norm(t);
  return x === "sse" || x.includes("streamable_http_and_sse");
}

export const McpServerFilter = {
  hasHTTP(s: McpServer) {
    return (s.remotes ?? []).some(r => transportIsHttp(r.transport));
  },
  hasSSE(s: McpServer) {
    return (s.remotes ?? []).some(r => transportIsSse(r.transport));
  },
  isNpm(s: McpServer) {
    return norm(s.package_registry) === "npm";
  },
  isPython(s: McpServer) {
    const r = norm(s.package_registry);
    return !!r && r !== "npm";
  },
};

function authsForTransport(s: McpServer, want: "http"|"sse"): string[] {
  const trs = (s.remotes ?? []).filter(r =>
    want === "http" ? transportIsHttp(r.transport) : transportIsSse(r.transport)
  );
  return trs.map(r => norm(r.authentication_method) || "unknown");
}

function intersects(a: string[], b: string[]) {
  if (!a.length || !b.length) return false;
  const set = new Set(a);
  for (const x of b) if (set.has(x)) return true;
  return false;
}

/**
 * Semantics
 * - Name/description always applied.
 * - If filtersEnabled=false → bypass all structured filters.
 * - Transport group and Package group are INDEPENDENT and combined by OR.
 *   * Transport group is active if hasHTTP or hasSSE is true.
 *     - For each selected transport: mode=all → auth ignored; mode=specific → must intersect selected kinds (unknown excluded).
 *     - A server matches the transport group if it matches ANY selected transport (HTTP or SSE).
 *   * Package group is active if hasNpm or hasPython is true.
 *     - A server matches the package group if it matches ANY selected package kind.
 * - If neither group is active → pass-through.
 */
export function matchesServer(s: McpServer, opts: FilterOpts): boolean {
  // Text search
  if (opts.name) {
    if (!norm(s.name).includes(norm(opts.name))) return false;
  }
  if (opts.description) {
    const hay = `${norm(s.short_description)} ${norm(s.EXPERIMENTAL_ai_generated_description)}`;
    if (!hay.includes(norm(opts.description))) return false;
  }

  if (!opts.filtersEnabled) return true;

  // Transport group
  const tActive = !!(opts.hasHTTP || opts.hasSSE);
  let tMatch = false;
  if (tActive) {
    const haveHttp = McpServerFilter.hasHTTP(s);
    const haveSse  = McpServerFilter.hasSSE(s);

    const httpOk =
      !!opts.hasHTTP &&
      haveHttp &&
      (
        opts.httpAuthMode !== "specific" ||
        (opts.httpAuth?.length ? intersects(authsForTransport(s, "http").filter(a => a !== "unknown"), opts.httpAuth!) : false)
      );

    const sseOk =
      !!opts.hasSSE &&
      haveSse &&
      (
        opts.sseAuthMode !== "specific" ||
        (opts.sseAuth?.length ? intersects(authsForTransport(s, "sse").filter(a => a !== "unknown"), opts.sseAuth!) : false)
      );

    tMatch = httpOk || sseOk;
  }

  // Package group
  const pActive = !!(opts.hasNpm || opts.hasPython);
  let pMatch = false;
  if (pActive) {
    const npm = McpServerFilter.isNpm(s);
    const py  = McpServerFilter.isPython(s);
    pMatch = (!!opts.hasNpm && npm) || (!!opts.hasPython && py);
  }

  // Combine by OR; if no active groups, pass-through
  if (!tActive && !pActive) return true;
  return (tActive ? tMatch : false) || (pActive ? pMatch : false);
}