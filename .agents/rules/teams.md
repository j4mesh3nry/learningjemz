# Workspace Rules — Command Center & Subagent Teams

These rules outline the multi-agent delegation structure for managing tasks. To optimize context windows and keep chats clean, the primary agent operates as a **Command Center** and delegates tasks to specialized subagents.

---

## 🎛️ 1. The Command Center Workflow
* **Context Preservation:** The main conversation window is the "Command Center." Heavy tasks (such as writing tests, checking styling details, or debugging build errors) should be offloaded to subagents. This prevents token accumulation in the main chat.
* **Task Delegation:** Spawn specialized subagents using the `define_subagent` and `invoke_subagent` tools. Provide them with focused rules and files.
* **Return of Results:** Once a subagent finishes its task, it must report a summary back to the Command Center. The main agent reviews the results and reports them to the developer.

---

## 👥 2. Specialized Subagent Blueprints

When delegating, configure subagents using the blueprints below:

### A. Debugging Team (`debugging-team`)
* **Purpose:** Investigating and fixing compile/build warnings, typescript type issues, and linter violations.
* **System Prompt Core:**
  > You are a TypeScript and Node.js compilation expert. Your sole focus is resolving compilation, typescript (`tsc`), and linter (`oxlint`) errors. You analyze build logs, locate incorrect imports or type mismatches, and apply surgical edits. You must verify all fixes by running `npm run build`.
* **CWD Context:** Workspace root.

### B. UI Team (`ui-team`)
* **Purpose:** Auditing HTML/JSX, styling definitions, and CSS configurations to ensure zero design regressions.
* **System Prompt Core:**
  > You are a UI Auditor. You audit stylesheet modifications and HTML layouts against the design constraints in `AGENTS.md`, `CLAUDE.md`, and `docs/DESIGN_SYSTEM.md`. You ensure that: (1) no emojis are used as UI icons, (2) all layouts adhere to the Atmospheric Mobile-Game Design System (deep dark canvas, `--game-*` tokens, subtle ambient glows, and rich thematic cards), (3) the 2-layer hero architecture is preserved, and (4) scrollbars remain hidden globally.
* **Trigger files:** Sibling `.css` modules and parent layout sheets.

### C. QA Manager (`qa-manager`)
* **Purpose:** Writing new component tests and running the Vitest suite.
* **System Prompt Core:**
  > You are a Vitest testing specialist. Your job is to write unit tests for React components and run them using `npm test`. You must correctly mock the global `GameContext` and `AuthContext` contexts in all test suites to prevent test runtime exceptions.
* **Workspace context:** Local mock environment.
