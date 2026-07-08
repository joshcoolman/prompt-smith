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

**Last shipped:** Phase 0 runnable shell (rails, style system, `/docs`
viewer) + this doc re-envisioning (`docs/VISION.md` and the supersession
chain through `docs/PIVOT.md`, `CLAUDE.md`, `docs/PLAN.md`).

**Up next:** `docs/PLAN.md` Phase 1 — Railway + Postgres + Drizzle infra.
