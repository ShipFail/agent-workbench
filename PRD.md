# Agent Workbench (AWB) – MVP Product Requirements Document

> **One-liner**: Agent Workbench (AWB) is an MCP-powered "crafting table" where AI agents can create, manage, search, equip, evolve, and forget tools — using a memory-aware inventory that behaves like short-term, medium-term, and long-term human memory.

---

## 1. Context & Vision

### 1.1 Background

Modern AI agents often depend on a static, hand-curated set of tools. As the number of tools grows, performance, reasoning quality, and maintainability all degrade:

* Too many tools → higher selection cost & confusion
* Too few tools → agents can’t adequately solve complex tasks
* Tools are typically designed by humans, not by agents themselves

In contrast, **Minecraft** offers a powerful mental model:

* The **player** faces a problem
* Goes to a **Workbench / Crafting Table**
* Uses recipes & ingredients to **craft tools**
* **Equips** a small subset of tools to solve the current task
* Stores the rest in **inventory / chests** for later

**Agent Workbench (AWB)** applies this model to AI agents:

* **Agents = player**
* **AWB = crafting table / workbench**
* **Tools = crafted items**
* **Inventory = tool memory store**
* **Tool selection = equipping items for the current task**
* **RAG = searching through tool memory/inventory**

### 1.2 Vision

Create a **minimal but production-ready MCP tool** that:

1. Runs as a **simple MCP server** (`npx awb start`)
2. Exposes a **small set of MCP commands** that allow agents to:

   * Craft tools
   * Call tools
   * Delete tools
   * List tools
   * Search tools
3. Maintains a **three-layer tool memory model**:

   * Short-term cache
   * Medium-term storage
   * Long-term toolkit
4. Allows agents to **self-serve**: they can create and evolve their own tools over time, based on task pressure and usage feedback.

This MVP focuses on **core functionality and stability**, not UI. The primary user is an **AI agent runtime** integrating via MCP.

---

## 2. Problem Statement

### 2.1 Core Problems

1. **Tool overload**: Providing many tools to an agent often degrades performance.
2. **Static, human-curated tools**: Tools are usually manually defined and not adapted by agents.
3. **Poor tool memory**: Agents lack a robust way to remember and reuse tools crafted in past tasks.
4. **No standard “Workbench” abstraction**: There is no canonical MCP tool that agents can use to craft their own tools.

### 2.2 Desired Outcomes

* Agents can **dynamically craft** new tools when needed.
* Tools are **stored, searched, and reused** via an inventory model.
* Only a **small active set** of tools is exposed to the agent for a given problem.
* Tool usage statistics drive **promotion/demotion** between memory layers.

---

## 3. Goals & Non-Goals

### 3.1 Goals (MVP)

1. **Provide a minimal MCP server** exposing core AWB functionality.
2. **Implement core MCP commands**:

   * `awb.craft`
   * `awb.call`
   * `awb.list`
   * `awb.search`
   * `awb.delete`
3. **Implement inventory & memory tiers**:

   * Storage of tool definitions and metadata
   * Short-term / medium-term / long-term memory levels
   * Basic promotion/demotion rules based on usage
4. **Provide a simple CLI** for:

   * Initializing a workspace
   * Starting/stopping the MCP server
   * Inspecting inventory as a human
5. **Ensure production-quality robustness**:

   * Clear error handling
   * Reasonable limits & timeouts
   * Simple persistence (e.g., JSON or SQLite)

### 3.2 Non-Goals (MVP)

1. No complex GUI or web UI (may have optional basic status page later).
2. No distributed cluster or sharding of tools.
3. No advanced evaluation framework (e.g., automatic quality scoring).
4. No multi-tenant isolation; assume a single logical tenant per AWB instance.
5. No full code sandboxing beyond basic execution safety (though we should design for future sandboxing).

---

## 4. Personas & Users

### 4.1 Primary Persona: **AI Agent Runtime / Orchestrator**

* Integrates with MCP servers
* Calls MCP tools based on model reasoning
* Needs a stable, predictable contract
* Goals:

  * Allow agents to craft tools without human involvement
  * Reuse tools across sessions/tasks

### 4.2 Secondary Persona: **Agent Developer / Researcher**

* Human configuring the system and experimenting
* Installs `awb`, starts MCP server, inspects inventory
* Goals:

  * Simple setup and configuration
  * Debug and inspect crafted tools and their usage

### 4.3 Tertiary Persona: **Platform / Infra Engineer**

* Responsible for reliability, scaling, security
* Goals:

  * Clear operational model (logs, metrics, storage)
  * Safe resource limits

---

## 5. High-Level Concept & Architecture

### 5.1 Conceptual Model

* **AWB MCP Server**: A process that exposes the MCP tools.
* **Tool Inventory**: Persistent store of all crafted tools + metadata.
* **Execution Engine**: Executes tool code when `awb.call` is invoked.
* **Memory Manager**: Manages memory tiers and promotion/demotion.

### 5.2 High-Level Components

1. **CLI** (`npx awb`)

   * `init`, `start`, `inventory`, `doctor`, `stop`

2. **MCP Layer**

   * MCP tool definitions & JSON schema
   * Request routing to internal handlers

3. **Tool Registry & Inventory**

   * Data model for tools
   * Storage backend (e.g., SQLite + JSON)
   * Query/search APIs

4. **Execution Sandbox (MVP)**

   * Controlled environment (e.g., Node.js function execution)
   * Timeouts and output size limits

5. **Memory Manager**

   * Usage tracking (count, timestamps)
   * Promotion/demotion logic
   * Archive logic

---

## 6. User Stories

### 6.1 AI Agent Runtime & Agents

1. **Crafting a New Tool**
   *As an AI agent*, when I encounter a complex problem that would benefit from a reusable operation, *I want to craft a new tool* via `awb.craft`, so that I can reuse it in future steps.

2. **Calling an Existing Tool**
   *As an AI agent*, when I know a tool exists that matches my need, *I want to call it* via `awb.call`, so I can use its functionality in my reasoning loop.

3. **Searching for Tools**
   *As an AI agent*, when I have a problem description or a rough query, *I want to search tools* via `awb.search`, so I can find the best candidate tools to equip for the current task.

4. **Listing Tools**
   *As an AI agent*, I want to list tools via `awb.list` with filters, so I can explore what capabilities are available in the inventory.

5. **Deleting a Tool**
   *As an AI agent*, when I determine that a previously crafted tool is incorrect or harmful, *I want to delete it* via `awb.delete`, so it won’t be reused inadvertently.

6. **Working with Memory Tiers**
   *As an AI agent*, I don’t want to manually manage memory tiers; I want AWB to automatically keep hot tools close and archive cold tools, so I can focus on solving the task.

### 6.2 Agent Developer / Researcher

7. **Initialize an AWB Workspace**
   *As a developer*, I want to run `npx awb init` to create a new workspace with config and inventory files, so I can quickly start experimenting.

8. **Start the MCP Server**
   *As a developer*, I want to run `npx awb start` with minimal flags, so I can expose AWB as an MCP server to my agent runtime.

9. **Inspect Inventory**
   *As a developer*, I want to run `npx awb inventory list` or `search`, so I can see what tools my agents have crafted and how often they’re used.

10. **Troubleshoot Problems**
    *As a developer*, I want `npx awb doctor` to verify configuration, connectivity, and storage, so I can quickly diagnose environment issues.

### 6.3 Platform / Infra Engineer

11. **Resource Limits**
    *As an infra engineer*, I want AWB to enforce sensible limits (e.g., max tools, max code size, timeouts), so the system remains stable even if agents try to create too many tools.

12. **Persistent Storage**
    *As an infra engineer*, I want AWB to persist tools reliably (e.g., using a local DB file), so tools survive process restarts.

---

## 7. User Journeys & Flows

### 7.1 Journey 1: Developer Sets Up AWB

1. Developer runs `npx awb init` in a project directory.
2. AWB creates:

   * `awb.config.json`
   * `inventory.db` (or equivalent)
   * `tools/` directory (optional)
3. Developer runs `npx awb start --port 7777`.
4. AWB starts MCP server on port 7777 and logs tool endpoints.
5. Developer configures agent runtime to connect to AWB MCP server.

### 7.2 Journey 2: Agent Crafts & Uses a Tool

1. Agent faces a complex sub-problem (e.g., "resize images to fit a canvas").
2. Agent determines a generalizable operation is beneficial.
3. Agent calls `awb.craft` with:

   * `name`, `description`, `code`, `metadata.tags`, `metadata.problem`.
4. AWB validates input, stores tool in inventory with `memory_level = short_term`, `usage_count = 0`.
5. Agent calls `awb.call` with the new `tool_id` and parameters.
6. AWB executes tool code, returns result, increments usage count and updates timestamps.
7. On repeated use, Memory Manager promotes tool to medium-term, and potentially to long-term.

### 7.3 Journey 3: Agent Searches & Equips Tools

1. Agent receives a new task that might benefit from previous tools.
2. Agent calls `awb.search` with a natural language query.
3. AWB performs semantic + keyword search over tool metadata and returns sorted candidates.
4. Agent chooses 1–3 tools to use actively in the current task (conceptually "equipping" them).
5. Agent uses `awb.call` on selected tools during its reasoning.

### 7.4 Journey 4: Tool Becomes Cold & Archived

1. A tool is crafted and used a few times but then not used for weeks.
2. Memory Manager periodically checks last-used timestamps.
3. If a tool is unused beyond a threshold (configurable), it moves from:

   * medium-term → short-term → archived state
4. Archived tools remain searchable (low priority) or can be fully purged via CLI (MVP decision: keep simple and just mark archived).

---

## 8. Feature List (MVP Scope)

### 8.1 CLI Features

1. `npx awb init`

   * Create workspace files
2. `npx awb start`

   * Start MCP server
   * Options: `--port`, `--config`, `--inventory`, `--verbose`
3. `npx awb inventory list`

   * Show all tools (id, name, memory level, usage count)
4. `npx awb inventory search <query>`

   * Search tools using the same mechanism as `awb.search`
5. `npx awb inventory inspect <tool_id>`

   * Print full metadata and code
6. `npx awb doctor`

   * Validate config, DB connectivity

### 8.2 MCP Tools (Core)

1. `awb.craft`

   * Input: tool definition (name, description, code, metadata)
   * Output: `tool_id`, status, memory level
2. `awb.call`

   * Input: `tool_id`, params (JSON)
   * Output: result, updated usage stats
3. `awb.list`

   * Input: optional filters (tags, memory level, search query)
   * Output: list of tools (id, name, description, memory level, usage)
4. `awb.search`

   * Input: text query, `top_k`
   * Output: ranked tool candidates
5. `awb.delete`

   * Input: `tool_id`
   * Output: status

### 8.3 Tool Inventory & Data Model

Each tool entry MUST include at least:

* `tool_id` (string, unique)
* `name` (string, human-readable)
* `description` (string)
* `code` (string; MVP: JS/TS function or similar)
* `metadata` (object):

  * `tags` (string[])
  * `problem` (string; problem description)
  * `created_by_agent` (string)
* `created_at` (timestamp)
* `updated_at` (timestamp)
* `last_used_at` (timestamp | null)
* `usage_count` (integer)
* `memory_level` (enum: `short_term`, `medium_term`, `long_term`, `archived`)
* `status` (enum: `active`, `deleted`, `archived`)

### 8.4 Memory Manager (MVP Rules)

Initial simple heuristics:

* **On tool creation:**

  * `memory_level = short_term`
  * `usage_count = 0`

* **On each `awb.call` success:**

  * `usage_count++`
  * `last_used_at = now`

* **Promotion (periodic or on-call):**

  * `short_term → medium_term` if `usage_count >= 5`
  * `medium_term → long_term` if `usage_count >= 50`

* **Demotion / Archiving (periodic job, e.g., run every N calls or time-based):**

  * `medium_term → short_term` if `last_used_at` older than N days
  * `short_term → archived` if unused beyond M days

Values for N, M should be configurable in `awb.config.json`.

### 8.5 Search / RAG Layer

* MVP can use a hybrid approach:

  * Full-text search on `name`, `description`, `metadata.problem`, `metadata.tags`
  * Optionally, embeddings-based similarity (if a configured embedding API is available)
* Result structure:

  * `tool_id`, `name`, `description`, `score`, `memory_level`, `usage_count`

---

## 9. Detailed MCP API Contracts (MVP)

### 9.1 `awb.craft`

**Description:** Create/register a new tool in the inventory.

**Input schema (conceptual):**

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "description": { "type": "string" },
    "code": { "type": "string" },
    "metadata": {
      "type": "object",
      "properties": {
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "problem": { "type": "string" },
        "created_by_agent": { "type": "string" }
      },
      "required": []
    }
  },
  "required": ["name", "code"]
}
```

**Output schema (conceptual):**

```json
{
  "tool_id": "tool_123",
  "status": "created",
  "memory_level": "short_term"
}
```

---

### 9.2 `awb.call`

**Description:** Execute an existing tool.

**Input schema (conceptual):**

```json
{
  "type": "object",
  "properties": {
    "tool_id": { "type": "string" },
    "params": { "type": "object" }
  },
  "required": ["tool_id"]
}
```

**Output schema (conceptual):**

```json
{
  "result": {},
  "usage_count": 12,
  "memory_level": "medium_term"
}
```

Error conditions:

* Tool not found
* Tool marked deleted
* Execution timeout
* Runtime error (should be returned in a controlled, structured way)

---

### 9.3 `awb.list`

**Description:** List tools with optional filters.

**Input schema (conceptual):**

```json
{
  "type": "object",
  "properties": {
    "memory_level": { "type": "string" },
    "tag": { "type": "string" },
    "query": { "type": "string" },
    "limit": { "type": "number" }
  }
}
```

**Output:**

```json
{
  "tools": [
    {
      "tool_id": "tool_123",
      "name": "resizeImage",
      "description": "Resize image to width and height",
      "memory_level": "medium_term",
      "usage_count": 17
    }
  ]
}
```

---

### 9.4 `awb.search`

**Description:** Search for tools by query.

**Input schema (conceptual):**

```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "top_k": { "type": "number" }
  },
  "required": ["query"]
}
```

**Output:**

```json
{
  "results": [
    {
      "tool_id": "tool_123",
      "name": "resizeImage",
      "description": "Resize image to width and height",
      "score": 0.92,
      "memory_level": "medium_term",
      "usage_count": 17
    }
  ]
}
```

---

### 9.5 `awb.delete`

**Description:** Soft-delete a tool.

**Input schema (conceptual):**

```json
{
  "type": "object",
  "properties": {
    "tool_id": { "type": "string" }
  },
  "required": ["tool_id"]
}
```

**Output:**

```json
{
  "tool_id": "tool_123",
  "status": "deleted"
}
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

* MCP operations should typically complete within **< 500 ms**, excluding tool execution.
* Tool execution should have a configurable timeout (e.g., default 5 seconds).

### 10.2 Reliability

* AWB must not crash on malformed agent input.
* AWB must not lose existing tools on restart.

### 10.3 Security & Safety (MVP)

* Defensive execution environment:

  * Limit access to filesystem and network by default (or require explicit opt-in in config).
* Limit maximum code size per tool.
* Limit maximum number of tools in inventory (configurable; default e.g., 1000).

### 10.4 Observability

* Log MCP calls, tool creation, tool execution outcomes.
* Log errors with stack traces where relevant.
* Optional: simple metrics counters (tools created, called, deleted).

---

## 11. Configuration (awb.config.json)

Example fields:

```json
{
  "port": 7777,
  "inventory_path": "./inventory.db",
  "max_tools": 1000,
  "tool_execution_timeout_ms": 5000,
  "memory": {
    "promotion_threshold_medium": 5,
    "promotion_threshold_long": 50,
    "demotion_days_medium_to_short": 30,
    "archive_days_short": 60
  },
  "search": {
    "mode": "text",  
    "embedding_provider": null
  }
}
```

---

## 12. Implementation Plan & Milestones (MVP)

### Milestone 1 – Skeleton & CLI

* [ ] Create `npx awb` CLI
* [ ] Implement `init`, `start`, `doctor`
* [ ] Basic config loading

### Milestone 2 – MCP Server & Core Tools

* [ ] Implement MCP server scaffold
* [ ] Define MCP tools: `awb.craft`, `awb.call`, `awb.list`, `awb.search`, `awb.delete`
* [ ] Wire MCP to internal handler functions

### Milestone 3 – Inventory & Storage

* [ ] Define tool data model
* [ ] Implement storage layer (SQLite/JSON)
* [ ] Implement CRUD for tools (create, read, list, delete)

### Milestone 4 – Execution Engine

* [ ] Implement basic execution sandbox (e.g., Node.js function eval with boundaries)
* [ ] Add timeouts and error handling

### Milestone 5 – Memory Manager & Search

* [ ] Implement usage tracking
* [ ] Implement promotion/demotion rules
* [ ] Implement basic text-based search
* [ ] Integrate search with MCP and CLI

### Milestone 6 – Hardening & Docs

* [ ] Add logging & basic metrics
* [ ] Define limits and defaults
* [ ] Write README and quickstart guide
* [ ] Add basic test coverage for core flows

---

## 13. Open Questions & Future Extensions

1. **Execution Sandboxing**: How strict should sandboxing be in MVP vs. later?
2. **Language Support**: Start with JS/TS only, or design for pluggable runtimes?
3. **Advanced Evaluation**: Later we may add tool quality scoring, auto-refinement, A/B comparisons.
4. **UI**: Do we want a minimal web UI to visualize tools and memory tiers?
5. **Multi-tenant Mode**: Isolating tools by agent or by user.

---

## 14. Summary

The **Agent Workbench (AWB)** MVP is a **small but powerful MCP server** that gives agents a **Minecraft-style Workbench** for tools:

* Agents **craft tools** when needed (`awb.craft`)
* Agents **call tools** as part of their reasoning (`awb.call`)
* AWB stores tools in a **memory-aware inventory** with short-, medium-, and long-term layers
* AWB offers **search and listing** (`awb.search`, `awb.list`) so agents can rediscover existing tools
* Developers manage configuration via a simple CLI (`npx awb`)

This PRD defines the minimum set of features and behaviors needed to build a **production-quality MVP** that is coherent, intuitive, and ready for experimentation and extension.
