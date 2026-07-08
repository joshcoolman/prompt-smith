# prompt-smith — build plan

> **Rewritten (2026-07-07)** — see [`docs/VISION.md`](VISION.md) for the
> what/why. This is the new phased build order. The original Phase 1–4
> (complaint-driven fixer) are kept below as history, not deleted — they no
> longer apply.

The concrete, phased build order. Read `VISION.md` for the what/why; this is
the how and the sequence. Each phase has a clear output — when the phase is
done, that thing is runnable and testable.

---

## Phase 0 — Runnable shell (complete)

The scaffold is live. `pnpm dev` serves the app. The style system (Paper & Ink),
the `/docs` viewer, the feature seams, and the knowledge files are all in place.
Nothing functional yet — just the rails.

**What's in place:**

- Shell: `/docs` viewer at `src/routes/docs.tsx`
- Style system: `src/styles/` (tokens, base, typography, index), theme toggle
- Feature seams: `src/features/` — `improve`, `generate`, `verify`, `knowledge`, `prefs`
- Knowledge: `knowledge/prompt-craft.md`, `anti-patterns.md`, `rubric.md`
- Docs: `OVERVIEW.md`, `SPEC.md`, `PLAN.md`, `STYLE.md`

---

## Phase 1.5 — Auth (complete)

Single-user email/password sign-in gating the whole app (`/`) behind a
vendor-agnostic seam, Supabase as the first adapter. Sequenced ahead of
Phase 2 since that phase wires in server-side API keys, and the app was
public with zero auth gate until this shipped.

1. The feature's boundary doc and `types.ts` (the `AuthClient` contract)
   first.
2. Implement behind the feature's public `index.ts`: a lazy env-tolerant
   Supabase adapter, an in-memory mock adapter, a React provider + `useAuth`.
3. Test the contract via the mock adapter — no network, green without env
   vars (CI has none).
4. Gate `/` itself (not a separate `/dashboard` — the whole app is the
   protected surface); mount the provider at the root. `/docs` stays public.
5. `scripts/setup.mjs` (`pnpm setup:supabase`) — the user runs it: link or
   create the hosted Supabase project, write `.env.local`, provision the
   single user via the admin API. No signup UI exists.

After this phase: visiting `/` signed-out redirects to `/login`; signing in
lands back where you were headed; a hard reload stays signed in.

---

## Phase 1 — Infra: Railway + Postgres + Drizzle

**Output:** Schema migrates, app boots, connects to Postgres via `railway dev`.

**What to build:**

1. ✅ Provisioned via the Railway MCP + agent-driven setup: project
   `prompt-smith`, an app service (deploys from GitHub `main`, public
   domain https://prompt-smith-production.up.railway.app), a
   private-network Postgres (no public port) with a volume mounted at
   `/var/lib/postgresql/data`, and `DATABASE_URL` wired from Postgres to
   the app service via reference variable. Fixed two deploy bugs found
   along the way: missing `package.json` `start` script (Railpack fell
   back to static-only serving instead of running the SSR server) and
   `vite preview`'s default host allowlist blocking the Railway domain
   (`vite.config.ts` `preview.allowedHosts`).
2. Drizzle schema: `projects`, `personas` (versioned), `saved_inputs`
   (+ attachments), `runs`.
3. Confirm the app connects to Postgres locally through `railway dev` and
   that migrations run cleanly.

## Phase 2 — Effect AI provider layer

**Output:** One working run, callable outside the UI (script/curl).

**What to build:**

1. Install `effect`, `@effect/ai`, `@effect/ai-anthropic`,
   `@effect/ai-openai`, `@effect/schema`, `@effect/platform-node`.
2. A backend endpoint: persona + input (text/image/PDF) + model choice →
   raw output.
3. Prove one real multimodal call end-to-end. API keys stay server-side
   only — never in browser storage.

## Phase 3 — Core UI: Projects, Personas, Inputs, single Run

**Output:** The full single-run loop works in the browser.

**What to build:**

1. CRUD for Projects, Personas, and Saved Inputs.
2. A run screen: persona × input × model → raw output.

## Phase 4 — Side-by-side comparison

**Output:** The actual target experience — same input run across multiple
models and/or persona versions in parallel, shown side by side.

## Phase 5 (later, if earned) — Golden-set bulk runs

A saved input becomes a set; run a persona against the whole set in one
action. Decide then whether it needs a queue or a second Railway service.

---

## Original phases 1–4 (superseded — see above and VISION.md) — kept as history

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
