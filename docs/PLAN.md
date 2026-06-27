# prompt-smith — build plan

The concrete, phased build order. Read `SPEC.md` for the what/why; this is the
how and the sequence. Each phase has a clear output — when the phase is done,
that thing is runnable and testable.

---

## Phase 0 — Runnable shell (complete)

The scaffold is live. `pnpm dev` serves the app. The style system (Paper & Ink),
the `/docs` viewer, the feature seams, and the knowledge files are all in place.
Nothing functional yet — just the rails.

**What's in place:**
- Shell: `src/components/home.tsx`, `/docs` viewer at `src/routes/docs.tsx`
- Style system: `src/styles/` (tokens, base, typography, index), theme toggle
- Feature seams: `src/features/` — `improve`, `generate`, `verify`, `knowledge`, `prefs`
- Knowledge: `knowledge/prompt-craft.md`, `anti-patterns.md`, `rubric.md`
- Docs: `OVERVIEW.md`, `SPEC.md`, `PLAN.md`, `STYLE.md`

---

## Phase 1 — One-pass vertical (the v1)

**Output:** Paste a prompt and a complaint, get an improved prompt back. One
pass — no loop yet. This is the thing you'd actually use.

**What to build:**

1. **`src/features/knowledge/index.ts`** — the loader. `import.meta.glob` over
   `knowledge/*.md`, expose `getKnowledge(name)`. ~15 lines.

2. **`src/features/prefs/`** — BYO-key store. IndexedDB via a thin wrapper,
   mirrored to a sync in-memory object so render decisions are synchronous.
   Stores: API provider (Anthropic to start), BYO key, free-tier usage count.

3. **`src/features/improve/`** — the core feature. Takes a `PromptRecord`
   (prompt + complaint), calls `generate`, returns the improved prompt. Thin
   orchestrator — holds no provider logic.

4. **`src/features/generate/`** — the generation call. Assembles the system
   prompt from `prompt-craft.md` and `anti-patterns.md`, sends the user's
   prompt + complaint to the LLM, returns the improved version as a string.

5. **UI** — replace the home placeholder with:
   - Prompt input (textarea, large)
   - Complaint input (textarea, smaller — "what's wrong with it?")
   - Improve button
   - Output panel showing the improved prompt + a diff or side-by-side view
   - Key input panel (shown when no key is stored)

**Provider:** Anthropic Claude (claude-sonnet-4-6 or haiku-4-5 for speed).
Use `@anthropic-ai/sdk`. BYO-key, browser-side call only.

**No verifier yet.** The output is just "here's the improved prompt." The verify
loop comes in Phase 2.

---

## Phase 2 — Verify loop

**Output:** After generating, the agent checks its own work against the
complaint and the rubric, and revises if it failed. Hard iteration cap (3 max).

**What to build:**

1. **`src/features/verify/`** — takes the original prompt, the complaint, the
   improved prompt, and the rubric (`rubric.md`). Calls the LLM to judge whether
   the improvement actually addressed the complaint. Returns a `PromptVerdict`
   (pass/fail + specific failure modes from the rubric).

2. **Revise loop** in `src/features/improve/` — if the verdict is `fail`, pass
   the verdict's failure notes back to generate as additional constraints.
   Repeat up to the cap.

3. **UI** — show the verify loop in progress (iteration count, what the verifier
   flagged). Show the final verdict alongside the output.

---

## Phase 3 — Records and history

**Output:** Improved prompts are saved as addressable records. You can browse
past improvements.

**What to build:**

1. **`PromptRecord`** persistence — IndexedDB. Each record: ID, original prompt,
   complaint, improved prompt, verdict, timestamp.

2. **History UI** — a list of past records, click to load any of them.

3. **MCP readiness** — records have stable IDs. No MCP server yet, but the data
   shape is designed so one could be added in ~30 lines.

---

## Phase 4 (later, if earned) — Optimizer

The system prompt itself becomes the thing being optimized. You provide a
held-out test set (prompt + expected output pairs), and the agent mutates the
system prompt and watches the score climb. This is the evals/optimization rung —
the capstone if v1 proves its worth.

Do not build this first.
