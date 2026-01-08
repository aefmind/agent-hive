# Agent Hive 🐝

**From Vibe Coding to Hive Coding** — Organize the chaos into structured execution.

[![License: MIT with Commons Clause](https://img.shields.io/badge/License-MIT%20with%20Commons%20Clause-blue.svg)](LICENSE)

---


## Demo
https://github.com/user-attachments/assets/6290b435-1566-46b4-ac98-0420ed321204

## The Problem

AI coding assistants are powerful, but without structure you get:
- 🌀 Lost context between sessions
- 🔄 No record of decisions made
- 📝 Zero audit trail
- 🎯 Scope creep and forgotten requirements

### The Subagent Problem

When you use multiple AI agents (subagents) to parallelize work:
- 🤖 **Agents do their own thing** — No coordination, duplicated work
- 🔍 **Hard to trace** — What did each agent actually do?
- 📊 **Impossible to audit** — Which agent made which decision?
- 🎭 **Context fragmentation** — Each agent has partial picture

**You can technically trace subagent work, but it's painful.** Logs scattered everywhere, no unified view, manual correlation required.

### The Spec Kit Problem

Traditional solutions like Spec Kit require detailed specifications upfront. That works for some teams, but:
- Most developers just want to code — not write docs first
- Specs become outdated the moment you start coding
- Heavy process that doesn't fit agile workflows

---

## The Hive Solution

| Problem | Hive Solution |
|---------|---------------|
| Agents do their own thing | **Structured plans** — agents follow the approved plan |
| Hard to trace | **Automatic tracking** — every action logged to .hive/ |
| Impossible to audit | **Full audit trail** — who did what, when, why |
| Context fragmentation | **Shared context** — plan.md is the single source of truth |
| Upfront documentation | **Passive docs** — specs emerge as you work |

**Hive doesn't change how you work. It makes what happens traceable and auditable.**

---

## How It Works

```
You: "Let's add dark mode to the app"
Agent: Plans the feature, Hive automatically captures it
You: Review in VS Code, add comments, approve
Agent: Executes tasks in isolated worktrees
You: Ship with full audit trail
```

### The Magic: Automatic Capture

When you work with your AI agent, Hive automatically:
- 📋 **Captures plans** as they're discussed
- 💬 **Records decisions** from your conversation
- 🔄 **Tracks execution** of each task
- 📊 **Builds documentation** as a side effect

**You don't write specs. Specs write themselves.**

---

## Subagent Orchestration Made Easy 🤖

This is where Hive really shines. **Multi-agent workflows become manageable.**

### The Old Way (Chaos)

```
Main Agent: "Build auth system"
    │
    ├── Subagent 1: Does... something? 
    ├── Subagent 2: Also does... something?
    └── Subagent 3: Conflicts with Subagent 1?
    │
You: "What just happened?" 🤷
```

### The Hive Way (Orchestrated)

```
Main Agent: Creates plan, Hive tracks it
    │
    ├── Subagent 1: task-01 (own worktree, tracked)
    ├── Subagent 2: task-02 (own worktree, tracked)
    └── Subagent 3: task-03 (own worktree, tracked)
    │
Hive: Full audit of what each agent did
Main Agent: Merges all completed tasks
You: Clear visibility into everything ✅
```

### What Each Subagent Gets

- 🌳 **Isolated git worktree** — No conflicts with other agents
- 📋 **Clear task description** — From the approved plan
- 📊 **Own status.json** — Track progress independently
- 📝 **Summary on completion** — What was actually done

### What You Get

```
.hive/features/auth-system/tasks/
├── 01-extract-auth-logic/
│   ├── status.json    # started: 10:00, completed: 10:15
│   └── report.md      # "Extracted auth to AuthService class"
├── 02-add-token-refresh/
│   ├── status.json    # started: 10:05, completed: 10:20
│   └── report.md      # "Added refresh token rotation"
└── 03-update-api-routes/
    ├── status.json    # started: 10:10, completed: 10:25
    └── report.md      # "Updated 12 routes to use AuthService"
```

**Full visibility. Easy audit. No more "what did that agent do?"**

---

## Real Example: Building a React Todo App with Login

Let's walk through hiving a real feature. You want to build a todo app with authentication.

### Step 1: Start the Conversation

```
You: "Hive a plan for a React todo app with login"
```

That's it. The agent creates a structured plan:

```markdown
# React Todo App with Login

## Overview
Build a todo application with user authentication, 
persistent storage, and a clean UI.

## Tasks

### 1. Setup project and dependencies
Create React app with TypeScript, install auth and state libraries.

### 2. Build authentication flow
Login/signup pages, JWT handling, protected routes.

### 3. Create todo components
TodoList, TodoItem, AddTodo with proper state management.

### 4. Add API integration
Connect to backend, handle CRUD operations, sync state.

### 5. Polish UI and error handling
Loading states, error messages, responsive design.
```

### Step 2: Review in VS Code

Open VS Code. The Hive sidebar shows your plan. You can:
- Read through each task
- Add comments ("Let's use Zustand instead of Redux")
- Approve when ready

### Step 3: Execute

```
You: "Hive execute todo-app"
```

The agent works through each task. If you have subagents, they each get their own isolated worktree — no conflicts, full tracking.

### Step 4: Ship

When done, you have:
- **Working code** — The todo app with login
- **Clean git history** — Each task merged cleanly
- **Full audit trail** — What was done, when, by which agent

```
.hive/features/todo-app/
├── plan.md              # Your approved plan
└── tasks/
    ├── 01-setup-project/
    │   └── report.md    # "Created React app, installed zustand, react-router"
    ├── 02-build-auth/
    │   └── report.md    # "Built login/signup with JWT, added ProtectedRoute"
    └── ...
```

**That's hiving.** Natural conversation → structured execution → documented result.

---

## How to Hive

Just use the `hive` keyword in your conversation:

```
"Hive a plan for user authentication"
"Hive execute auth-feature"
"Hive status"
```

The agent handles everything. You review and approve in VS Code.

---

## VS Code Extension: Not Just CLI

**Hive isn't CLI-only.** The VS Code extension makes management visual:

- 📋 **Sidebar** — See all features and their progress at a glance
- 💬 **Inline Comments** — Add review comments directly on plan.md
- ✅ **Approve Button** — One-click plan approval
- 🔄 **Real-time Updates** — Watches .hive/ folder for changes
- 🚀 **Launch Tasks** — Open tasks in OpenCode from VS Code

```
┌─────────────────────────────────────┐
│ HIVE                           [+]  │
├─────────────────────────────────────┤
│ ▼ release-preparation    [15/15] ✅ │
│   ├─ 01-prepare-icon-asset     ✅   │
│   ├─ 02-update-packagejson     ✅   │
│   ├─ 03-update-packagejson     ✅   │
│   └─ ...                            │
│ ▶ auth-refactor          [0/5]  📋  │
│ ▶ dark-mode              [2/3]  🔄  │
└─────────────────────────────────────┘
```

**Review plans, add comments, approve — all without leaving VS Code.**

---

## Why Hive?

### 🎯 Easy Orchestrate
Break work into isolated tasks. Subagents work in parallel without conflicts. Plan is the contract.

### 📊 Easy Audit
Every decision, every change, every agent action — automatically captured in .hive/

### 🚀 Easy Ship
When you're done, you have:
- Clean git history (worktree merges)
- Full documentation (generated automatically)
- Traceable decisions (who did what, when)

---

## The Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  PLAN                                                       │
│  Chat with your agent about what to build                   │
│  Hive captures the plan automatically                       │
├─────────────────────────────────────────────────────────────┤
│  REVIEW (in VS Code)                                        │
│  See the plan in sidebar                                    │
│  Add inline comments, refine, approve                       │
├─────────────────────────────────────────────────────────────┤
│  EXECUTE (parallel-friendly)                                │
│  Main agent or subagents work on tasks                      │
│  Each task in isolated worktree                             │
│  Every action tracked and auditable                         │
├─────────────────────────────────────────────────────────────┤
│  SHIP                                                       │
│  Clean merges, full history                                 │
│  Documentation generated as side effect                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Packages

| Package | Platform | Description |
|---------|----------|-------------|
| **[opencode-hive](https://www.npmjs.com/package/opencode-hive)** | npm | OpenCode plugin — planning, execution, tracking |
| **[vscode-hive](https://marketplace.visualstudio.com/items?itemName=tctinh.vscode-hive)** | VS Code | Visual management — review, comment, approve |

---

## Quick Start

### 1. Add to OpenCode

Add `opencode-hive` to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-hive"
  ]
}
```

OpenCode handles the rest — no manual npm install needed.

### 2. Install VS Code Extension

```bash
code --install-extension tctinh.vscode-hive
```

Or search "Hive" in VS Code Extensions.

### 3. Start Hiving

```
You: "Hive a plan for user dashboard"
```

That's it. You're hiving.

---

## Built for the OpenCode Ecosystem

Designed to work seamlessly with:
- **[OpenCode](https://opencode.ai)** — The AI coding CLI
- **VS Code** — Your editor for reviews
- **Git** — Worktrees for isolation

Inspired by the workflow principles of **[Antigravity](https://antigravity.dev)**.

---

## Comparison

| Feature | Vibe Coding | Spec Kit | Agent Hive |
|---------|-------------|----------|------------|
| Setup required | None | Heavy | Minimal |
| Documentation | None | Upfront | Automatic |
| Planning | Ad-hoc | Required first | Conversational |
| Tracking | None | Manual | Automatic |
| Audit trail | None | If maintained | Built-in |
| Learning curve | None | Steep | Low |
| Multi-agent ready | ❌ Chaos | ❌ | ✅ Native |
| Subagent tracing | 😰 Painful | ❌ | ✅ Automatic |
| VS Code UI | ❌ | ❌ | ✅ Full support |

---

## License

MIT with Commons Clause — Free for personal and non-commercial use. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Stop vibing. Start hiving.</strong> 🐝
  <br><br>
  <em>Specs along the way. Not in the way.</em>
  <br>
  <em>Subagents under control. Finally.</em>
</p>
