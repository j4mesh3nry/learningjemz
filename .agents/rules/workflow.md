# Workspace Rules — AI Workflow & Grounding Rules

These rules govern all agent behaviors in this workspace to ensure token economy, prevent code hallucinations, and maintain absolute correctness.

---

## 💰 1. Saving AI Quota & Token Usage
To minimize API token usage and control costs:
* **Targeted File Reading:** Never do broad directory-wide sweeps or read entire files unless necessary. Check file structures using `list_dir` or `grep_search` first, then load specific line slices using `view_file` with `StartLine` and `EndLine`.
* **Micro-Edits over Complete Rewrites:** Never use `write_to_file` to overwrite an entire existing file when modifying logic. Always use `replace_file_content` or `multi_replace_file_content` to perform surgically targeted edits on specific lines.
* **Continuous Local Validation:** Use the local linter, TS compiler, and test suite via `npm run verify` to detect issues immediately. Do not ask the model to "guess" why a build or test failed; run the verification command and feed it the exact error log.

---

## 🛑 2. Preventing Hallucinations (Grounding Rules)
AI models must never guess variables, database configurations, state shapes, or method names.
* **File Definition Check:** You must read the source declaration of any state context hook, utility method, or schema file before referencing it in code. Specifically, view AuthContext.jsx and GameContext.jsx before editing state-dependent logic.
* **Dependency Verification:** Before introducing new library imports, read package.json to confirm the library exists and verify the exact version.

---

## 📋 3. Structured Architectural & Planning Loop (/pm)
For every non-trivial bug fix, refactor, or new feature:
1. **Analyze:** Assess the task against the project profile.
2. **Step Plan:** Outline ordered, component-specific steps.
3. **Diagrams:** Include both a Mermaid sequence/state diagram AND an ASCII box-flow diagram:
   - Use double-border boxes `╔════╗` / `╚════╝` for user-initiated actions (entry/exit).
   - Use single-border boxes `┌────┐` / `└────┘` for system state changes and backend/DB processing.
   - Limit flow diagrams to 4–12 nodes.
4. **Confidence Rating:** Assign a confidence score (0-100%) to each plan step with a one-line reason.
   - **Pause Condition:** If any step's confidence is **below 90%**, stop and ask the user specific clarifying questions to resolve the ambiguity. Do not proceed until confidence is restored to 90%+.
5. **Approval Gate:** Stop and wait for the user to explicitly click "Proceed" or write "Approved" before modifying any code or files.

---

## 🐙 4. Automated Git Workflow Rules
When handling git commands on behalf of the developer:
* **The CRLF Guard (Crucial):** Never run `git add -A` or `git add .` blindly. Check `git diff --ignore-cr-at-eol` first to see the true changes. Stage files individually (e.g., `git add path/to/file.js`) to prevent line-ending noise.
* **Feature Branches:** For new features, checkout a feature branch from `dev` (e.g., `git checkout -b feature/space-quiz`). For minor fixes, you may commit directly to `dev`.
* **Standard Commit Format:** Write clean, descriptive commit messages (e.g., `feat: scaffold space quiz challenge` or `fix: resolve stockfish bot mapping`).
* **Merging to Dev:** When the feature is complete and verified:
  1. `git checkout dev`
  2. `git merge feature/branch-name`
  3. `git branch -d feature/branch-name`
* **Promoting to Main:** Only when the user explicitly requests to merge to main:
  1. `git checkout main`
  2. `git merge dev`
  3. `git checkout dev`
