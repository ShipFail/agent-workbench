# Agent Workbench (AWB)

**The Crafting Table for AI Agents**

Agent Workbench (AWB) is an MCP tool designed as the *Minecraft-style Workbench* for AI agents. Just like players craft tools on a Workbench to solve problems in Minecraft, AI agents use AWB to craft, evolve, and manage new tools when solving complex tasks.

<div align="center">
  <image src="docs/agent-workbench-logo.webp" alt="Agent WorkBench Logo" height=256 width=256 />
</div>

AWB acts as a foundational crafting system where agents can:

* Create new tools on demand
* Combine existing primitives into more powerful utilities
* Manage, store, and version the tools they build
* Equip tools to solve increasingly complex challenges

---

## 🌟 Vision

AI agents should be able to create the tools they need.

In Minecraft, a player walks to the Crafting Table with ingredients and crafts the tool they need. Similarly, in AWB, an AI agent walks to the Agent Workbench with an intention and crafts the tool required to solve its problem.

**AWB is the Crafting Table for AI Agent ecosystems.**

---

## 🚀 Features (Current & Planned)

### **✔ MCP-native Tool Provider**

AWB exposes core crafting and management capabilities via MCP, enabling any agent framework to integrate it.

### **✔ Tool Creation Engine**

Agents can generate new tools through AWB:

* Prompt-based tool crafting
* Multi-step tool creation pipelines
* Tool recipes (like crafting recipes in Minecraft)

### **✔ Tool Management System**

* Register new tools dynamically
* Update or replace existing tools
* Namespace and versioning

### **✔ Intelligent Craft Guidance**

AWB can guide agents:

* What tools are missing
* How to craft a needed tool
* How to combine existing tools

### **✔ Multi-Agent Compatible**

Any agent can:

* Query available tools
* Craft new ones
* Share tools across teams or workflows

---

## 🧱 Architecture Overview

```
┌───────────────────────┐
│       AI Agent        │
└───────┬───────────────┘
        │ Uses MCP
┌───────▼───────────────┐
│   Agent Workbench     │  (AWB)
│  Crafting Interface   │
└───────┬───────────────┘
        │ Crafts
┌───────▼───────────────┐
│     New Tools         │
│  (Generated / Stored) │
└────────────────────────┘
```

### Core Concepts

* **Workbench** — The core AWB module where tools are crafted
* **Ingredients** — Inputs: prompts, schemas, templates, functions
* **Recipes** — Rules or patterns for how tools are created
* **Tools** — MCP-compatible tool definitions produced by AWB

---

## 🛠 Example Use Case

**Scenario:** An agent needs to scrape a website, but no scraping tool exists.

1. Agent detects missing capability
2. Agent invokes AWB`s `craftTool` API
3. AWB generates a scraping tool with schema + code
4. AWB registers it automatically
5. Agent uses the newly crafted tool to complete the task

This mirrors the Minecraft experience:

> *"I need an axe → go to Workbench → craft axe → chop tree."*

---

## 📦 Installation

From the project root:

```bash
npm install
npm run build
```

This compiles TypeScript to `dist/`.

---

## 💻 Usage

### 1. Initialize an AWB workspace

```bash
npx awb init
# or, if not installed globally:
node dist/cli.js init
```

This creates an inventory file at `.awb/inventory.json` if it does not exist.

### 2. Start the MCP server

```bash
npx awb start
# or
node dist/cli.js start
```

Options:

```bash
npx awb start --port 7777 --inventory .awb/inventory.json
```

The server runs an HTTP JSON-RPC endpoint on the given port.

### 3. CLI Inventory Commands (for humans)

List tools:

```bash
npx awb inventory list
```

Search tools:

```bash
npx awb inventory search "image resize"
```

Inspect a tool:

```bash
npx awb inventory inspect <toolId>
```

Delete a tool:

```bash
npx awb inventory delete <toolId>
```

---

## �� MCP Interface

The server implements a minimal subset of the MCP JSON-RPC interface over HTTP:

- `tools/list`
- `tools/call`

### Endpoint

```text
POST http://localhost:<port>/
Content-Type: application/json
```

### `tools/list`

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "awb_craftTool",
        "description": "Craft a new tool and store it in the Agent WorkBench inventory...",
        "inputSchema": { "...": "JSON Schema" }
      }
      // ...
    ]
  }
}
```

### `tools/call`

**General form:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "<toolName>",
    "arguments": {
      "...": "tool-specific arguments"
    }
  }
}
```

---

## 🧰 AWB Tools

The MCP server exposes these tools:

### 1. `awb_craftTool`

Crafts a new tool and stores it in the inventory.

**Arguments:**

- `name` (string, required)
- `description` (string, optional)
- `code` (string, optional – stored as reference only)
- `metadata` (object, optional)
  - `tags` (string[])
  - `problem` (string)
  - `createdByAgent` (string)

**Response:**

```json
{
  "tool": {
    "id": "tool_...",
    "name": "resizeImage",
    "memoryLevel": "short_term",
    "usageCount": 0,
    "...": "other metadata"
  }
}
```

### 2. `awb_deleteTool`

Deletes a tool by ID.

**Arguments:**

- `id` (string, required)

**Response:**

```json
{ "deleted": true }
```

### 3. `awb_listTools`

Lists tools in the inventory, optionally filtered.

**Arguments (optional):**

- `memoryLevel` (`short_term` | `medium_term` | `long_term` | `archived`)
- `query` (string – simple search over name/description/metadata)

**Response:**

```json
{ "tools": [ /* ToolRecord[] */ ] }
```

### 4. `awb_searchTools`

Searches tools using a lightweight scoring heuristic.

**Arguments:**

- `query` (string, required)
- `limit` (number, optional, default 5)

**Response:**

```json
{ "tools": [ /* ToolRecord[] */ ] }
```

### 5. `awb_callTool`

Records a conceptual invocation of a tool and promotes it along memory levels.

**Arguments:**

- `id` (string, required)
- `context` (string, optional)

**Response:**

```json
{
  "tool": {
    "id": "tool_...",
    "usageCount": 12,
    "memoryLevel": "medium_term",
    "...": "other metadata"
  },
  "message": "Tool usage recorded. This MVP does not execute dynamic code, only tracks and manages tools."
}
```

---

## 🧠 Memory / Inventory Model

Each tool has a `memoryLevel`:

- `short_term` – newly crafted tools, experimental tools
- `medium_term` – tools used enough times to be considered useful
- `long_term` – frequently used, highly valuable tools
- `archived` – tools that are not actively used (future extension)

### Promotion Logic (MVP)

- `short_term` → `medium_term` when `usageCount >= 5`
- `medium_term` → `long_term` when `usageCount >= 25`

Tools are updated on each `awb_callTool` invocation.

---

## 🧪 Roadmap

* [ ] MCP provider v1
* [ ] Tool crafting engine
* [ ] Tool storage backend
* [ ] Tool versioning & lifecycle
* [ ] Multi-agent collaboration
* [ ] Crafting recipes library
* [ ] Visual tool crafting dashboard

### Next Steps (MVP Evolution)

- Add auth / ACLs around MCP access.
- Introduce vector embeddings for better `awb_searchTools` retrieval.
- Implement safe execution sandboxes for tool `code`.
- Add metrics and observability (e.g., Prometheus, OpenTelemetry).
- Add tests and richer promotion/demotion policies.

---

## 🧩 Philosophy

Agents should:

* Build tools when needed
* Improve their environment
* Share and reuse tools
* Evolve over time

AWB exists to empower them.

---

## 🧙 Inspiration

Minecraft`s Workbench and Crafting Table — the core of creativity.

Your agent is the player.
AWB is the Workbench.
The tools it crafts are your AI system`s weapons, utilities, and magic.

---

## 🤝 Contributing

Contributions welcome! PRs, ideas, and crafting recipes invited.

---

## 📄 License

MIT
