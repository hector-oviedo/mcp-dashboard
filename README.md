# MCP Dashboard

> **Status:** Experimental. Use at your own responsibility.

A lightweight, open‑source web UI to **explore and connect to Model Context Protocol (MCP) servers** from the browser. It pulls the public server list from **Pulse**, supports **HTTP** and **SSE** transports, lets you attach **auth headers**, and provides a clean **Blueprint** panel to inspect capabilities and run tools.

---

## Table of Contents

* [What is MCP?](#what-is-mcp)
* [Prerequisites](#prerequisites)
* [Quickstart](#quickstart)
* [Using the Explorer](#using-the-explorer)

  * [Search](#search)
  * [Filters](#filters)
  * [Blueprint & Connector](#blueprint--connector)
  * [Running Tools](#running-tools)
* [How Transports Work (HTTP vs SSE)](#how-transports-work-http-vs-sse)
* [Disable CORS via Chrome (Dev‑Only)](#disable-cors-via-chrome-dev-only)

  * [Windows](#windows)
  * [macOS](#macos)
  * [Linux](#linux)
* [Architecture](#architecture)
* [Roadmap](#roadmap)
* [Security Notes](#security-notes)
* [License](#license)

---

## What is MCP?

**Model Context Protocol (MCP)** is a standard that lets AI apps (clients) talk to external **servers** that expose:

* **Tools** — actions the model can call (e.g., list and invoke tools).
* **Resources** — structured data the model can read.
* **Prompts** — reusable templates.

This project uses the official **MCP JS SDK** (`@modelcontextprotocol/sdk`) and its transports (`StreamableHTTPClientTransport` and `SSEClientTransport`) to handle the handshake and capability exchange, following best practices from the SDK documentation.

---

## Prerequisites

* **Node 18+** (or newer)
* **pnpm** (or npm / yarn)

---

## Quickstart

```bash
# install deps
pnpm i

# start dev server (Vite)
pnpm dev

# open the app
# http://localhost:5173  (or the port Vite prints)
```

> The dev server includes a **universal proxy** so you can connect to any remote MCP endpoint (HTTP or SSE) without CORS issues. If you prefer (or for isolated testing), you can also launch a dedicated Chrome instance with CORS disabled — see [Disable CORS via Chrome (Dev‑Only)](#disable-cors-via-chrome-dev-only).

---

## Using the Explorer

### Search

Use the **Name** and **Description** inputs to quickly narrow the list. This text search is always applied, even if structured filters are disabled.

### Filters

Filters live in a collapsible panel. You can **Enable filters** to apply structured rules, or turn them **off** to only use text search.

* **Transport & Auth**

  * Toggle **HTTP** and/or **SSE**. If neither is toggled, **no transport filter** is applied.
  * **Auth mode** per transport:

    * **All auths** → *no auth filter* (shows any auth, including unknown).
    * **Enable specific** → include only selected kinds: `open`, `oauth`, `api_key`. (Unknown/missing auth is excluded in this mode.)
  * If both HTTP and SSE are enabled, matching is **OR** across transports.

* **Package**

  * Toggle **NPM** and/or **Python**. If neither is toggled, **no package filter** is applied.
  * Matching is **OR** across selected kinds.
  * *Tip:* Servers with **no** package (e.g., some hosted services like DeepWiki) will only appear if **both** package toggles are **off** (i.e., no package filter).

> Transport filters and Package filters are **independent**. Enabling/disabling HTTP/SSE does **not** affect NPM/Python and vice versa.

Click **Apply** to activate your changes.

### Blueprint & Connector

Open a server to see its **Blueprint**:

* **Capabilities**: Only supported widgets are shown. Unsupported ones are hidden (you can still see on/off status in the capabilities summary).
* **Endpoints**: The UI surfaces available HTTP/SSE URLs.
* **Headers**: Add entries like `Authorization: Bearer <token>` or `x-api-key: <key>` as needed. *(Some servers require path‑based tokens instead of headers — e.g., Firecrawl.)*

### Running Tools

Each tool has two collapsible sections:

* **Description** — brief docs for the tool.
* **Parameters** — a compact, generated form from the tool’s JSON Schema.

  * The form is **collapsed by default**.
  * If the schema provides an **example**, the form starts with that example so you can **Run** in one click.
  * The **Run** button is inside the collapsible, right‑aligned.

Tool outputs are shown as formatted JSON.

---

## How Transports Work (HTTP vs SSE)

* **Streamable HTTP**: JSON‑RPC over HTTP POST. Supports streaming responses via the SDK’s streamable transport.
* **SSE (Server‑Sent Events)**: Long‑lived HTTP connection where the server pushes events. The SDK handles the event stream and POSTs messages back to the peer when needed.

The client attempts the selected transport. If a server rejects streamable HTTP with `405/501` (common for SSE‑only hosts), it can fall back to SSE.

---

## Disable CORS via Chrome (Dev‑Only)

If you run into CORS during local development (e.g., hitting MCP servers directly without the dev proxy), you can start a **separate Chrome instance** with web security disabled. **Do not use this instance for regular browsing.**

### Windows

1. Find your Chrome binary, typically:

   ```text
   C:\Program Files\Google\Chrome\Application\chrome.exe
   ```
2. On the Desktop, **Right‑click → New → Shortcut**.
3. In **Target**, paste the full command (quotes matter):

   ```text
   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --disable-web-security --user-data-dir="C:\\chrome-dev"
   ```
4. Name it e.g. **Chrome (CORS OFF)** and finish.
5. Launch this shortcut when developing, and use it **only** for the dashboard.

### macOS

From Terminal:

```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

> `-na` opens a new app instance; `--user-data-dir` ensures it uses a separate profile.

### Linux

From Terminal (Chromium/Chrome):

```bash
google-chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
# or
chromium --disable-web-security --user-data-dir=/tmp/chrome-dev
```

**Important:** This disables same‑origin protections for that instance. Keep it isolated and close it when done.

---

## Architecture

* **React + Vite + Tailwind** UI.
* **Universal dev proxy** handles *any* cross‑origin remote (HTTP & SSE) and forwards headers.
* **MCP client wrapper** built on `@modelcontextprotocol/sdk` for capability handshake and tool calls.
* **Pulse catalog** powers discovery (server list + metadata).

---

## Roadmap

* Launch MCP NPM packages directly from the UI.
* Optional **OAuth** flows in‑browser for servers that support it.
* Saved connections and header presets per server.
* Production proxy recipe and one‑click deploy.

---

## Security Notes

* This is **experimental**. Treat secrets with care.
* The dev proxy and CORS‑off Chrome **forward your headers** to target hosts. Review before use.
* Prefer a hardened reverse proxy in production with TLS termination and strict allowlists.

---

## License

MIT

---

**Acknowledgments:** Built on the MCP JS SDK and informed by best practices in the MCP documentation. Uses the Pulse server list for discovery.