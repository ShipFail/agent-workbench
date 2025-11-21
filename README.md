# agent-workbench

AWB is an MCP-powered crafting table where AI agents can create, manage, search, equip, evolve, and forget tools — using a memory-aware inventory that behaves like short-term, medium-term, and long-term human memory.

The AI Agent Workbench — a crafting table where agents craft new tools.

# Agent Workbench (AWB)

**The Crafting Table for AI Agents**

Agent Workbench (AWB) is an MCP tool designed as the *Minecraft-style Workbench* for AI agents. Just like players craft tools on a Workbench to solve problems in Minecraft, AI agents use AWB to craft, evolve, and manage new tools when solving complex tasks.

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
2. Agent invokes AWB's `craftTool` API
3. AWB generates a scraping tool with schema + code
4. AWB registers it automatically
5. Agent uses the newly crafted tool to complete the task

This mirrors the Minecraft experience:

> *"I need an axe → go to Workbench → craft axe → chop tree."*

---

## 📦 Installation

(Coming soon — MCP tool package, npm module, Python module, etc.)

```
npm install agent-workbench
```

---

## 🔌 MCP Interface

**Endpoints (draft):**

* `craftTool` — Create a new tool with constraints
* `registerTool` — Add a crafted tool to the environment
* `listTools` — Retrieve all available tools
* `deleteTool` — Remove or retire a tool
* `suggestToolRecipe` — Get recommended crafting strategies

Full schema coming soon.

---

## 🧪 Roadmap

* [ ] MCP provider v1
* [ ] Tool crafting engine
* [ ] Tool storage backend
* [ ] Tool versioning & lifecycle
* [ ] Multi-agent collaboration
* [ ] Crafting recipes library
* [ ] Visual tool crafting dashboard

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

Minecraft's Workbench and Crafting Table — the core of creativity.

Your agent is the player.
AWB is the Workbench.
The tools it crafts are your AI system's weapons, utilities, and magic.

---

## 🤝 Contributing

Contributions welcome! PRs, ideas, and crafting recipes invited.

---

## 📄 License

MIT
