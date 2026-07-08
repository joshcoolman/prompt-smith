# prompt-smith

> A self-hosted, multi-model prompt & persona playground — save inputs and personas, compare raw output across vendors, side by side.

**Status: direction re-envisioned (2026-07-07)** — see [`docs/VISION.md`](docs/VISION.md) for the current design. `docs/PIVOT.md` and the "complaint-driven prompt fixer" description below are superseded framing, kept as history rather than deleted.

---

## What this was (superseded — see VISION.md)

A focused, **agent-first**, BYO-key utility that improves a prompt against a stated problem. "Too verbose, too many canned phrases, bland image results" → it fixes that. Loop: improve → check against the complaint *and* the `/knowledge` rubric → revise until satisfied.

The verifier comes from two honest sources: **your complaint** (a checkable standard anchored to a real defect) and **the `/knowledge` folder** (the always-on baseline of what good prompt-craft looks like). The most fun file is `anti-patterns.md` — a living blocklist of phrases that produce mush; the app literally gets better as you grow it.

Full brief: [`docs/SPEC.md`](docs/SPEC.md) · umbrella vision: [`docs/OVERVIEW.md`](docs/OVERVIEW.md) · pivot: [`docs/PIVOT.md`](docs/PIVOT.md).

### Boundary (the lane is welded)

Improves a prompt against a problem. Not a prompt library, not a chat playground, not a model benchmark suite. Retune *what good prompt-craft means* via `/knowledge` only.

### Two depths (build the shallow one first)

- **v1 — complaint-driven:** prompt + complaint in, improved prompt out, judged against the complaint + `/knowledge`.
- **Later — optimizer:** the system prompt becomes the thing optimized against a held-out test set; watch the score climb. Downstream, only if v1 earns it.

## What this is now

A standalone, self-hosted, opinionated multi-model prompt/persona
playground: [text + image + PDF] in, raw output out, across whichever
models and personas you choose, judged by eye. Organized into Projects,
each holding its own versioned Personas, Saved Inputs, and Runs.

It explicitly does **not** score or auto-judge output, render
domain-specific previews (that stays in the app that actually consumes a
persona), stay live-coupled to any other repo (hand-off is copy-paste), or
support multiple tenants (self-hosted, single-user — deploy your own copy).

**Stack:** TanStack Start + React 19 + Tailwind v4 (unchanged) · `@effect/ai`
for provider-agnostic, multimodal LLM orchestration · `@effect/schema` for
validation · Drizzle ORM + Postgres for data · Railway for hosting (app
container + private Postgres + volume, plus its MCP server for
agent-driven ops).

Full detail: [`docs/VISION.md`](docs/VISION.md).

## Local development

```bash
pnpm install
pnpm dev      # http://localhost:3002
pnpm build    # production build
pnpm test     # vitest
pnpm lint
```

## Status

**Last shipped:** Drizzle schema merged to `main` (`projects`,
`personas`/`persona_versions`, `saved_inputs`/`saved_input_versions`/
`attachments`, `runs` — see `src/db/schema.ts`), migration generated at
`drizzle/0000_lumpy_blindfold.sql`, and `scripts/migrate.mjs` written as
a plain-JS migration runner for the deployed container (no `drizzle-kit`
CLI at runtime). This repo now uses branch → PR → merge per milestone
(see `CLAUDE.md`), and Claude has standing authorization to merge its
own PRs without waiting for review.

**Blocked:** Railway's app-service build has failed 3/3 times since the
Drizzle PR merged — deterministic, not transient (confirmed with a
100%-cache-hit retry that failed identically). `pnpm install` exits 1
right after a `[ERR_PNPM_IGNORED_BUILDS]` warning for `esbuild`
(multiple versions, pulled in via `drizzle-kit`'s dependency tree).
`pnpm-workspace.yaml` already declares `onlyBuiltDependencies:
[esbuild, lightningcss]`, which fully suppresses the issue locally —
but not on Railway's fresh builder. Root cause: locally this is masked
because the global pnpm store already has these exact package builds
cached/approved from other projects on this machine, so the approval
check never actually fires — meaning local success was never real
verification. **The live site is unaffected** (Railway keeps serving
the last successful deployment while a new one fails), so there's no
urgency, just an unresolved build blocker on `main`. A `pnpm dlx
drizzle-kit` detour (to drop `drizzle-kit` from the dependency tree
entirely) was tried and reverted — it breaks `drizzle-kit`'s ability to
resolve the project's local `drizzle-orm` version.

**Up next:** Resolve the Railway build failure (next candidate: a
CI-oriented pnpm setting to skip the build-script approval gate
entirely, rather than the allowlist approach already in place — needs
verifying against real docs, not memory, since it hasn't been
confirmed). Do this on a fresh branch, not `main`. Once the app
deploys again, run the migration (Josh still needs to choose: a
Pre-Deploy Command for automatic future migrations, or a one-off
`railway ssh -- pnpm db:migrate:deploy`). **After that**, per Josh's
explicit direction, the next phase is **auth** (`bootstrap:add-auth`
skill — single-user Supabase email/password, `/login` route, guarded
`/dashboard`) — deliberately sequenced *before* `docs/PLAN.md` Phase 2
(the AI provider layer, which wires in server-side API keys), since the
app is currently public with zero auth gate.
