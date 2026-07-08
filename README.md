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

**Last shipped:** Railway build blocker resolved and deployed (PR #5,
`fb1a8d0`). Root cause: `pnpm-workspace.yaml` listed `esbuild`/
`lightningcss` under `onlyBuiltDependencies`, a setting **removed in
pnpm v11** (this repo pins `pnpm@11.7.0`) in favor of `allowBuilds` —
the old key was silently ignored, so those builds were never approved
and every fresh install hit `ERR_PNPM_IGNORED_BUILDS` and exited 1
(confirmed directly from the Railway build log). Not a Drizzle
problem — esbuild is pulled in transitively by vite/vitest too. Fix
was moving both packages to `allowBuilds: true`. Verified live:
deployment `e1fcbf8f` succeeded on Railway.

Also wired up **automatic DB migrations**: Railway's Pre-Deploy Command
is now set to `pnpm db:migrate:deploy` (runs `scripts/migrate.mjs`
before the app starts, on every future deploy). Confirmed working —
deploy `6bb98169`'s logs show `$ node scripts/migrate.mjs` →
`Migrations applied` before the container started. The Drizzle schema
(`projects`, `personas`/`persona_versions`, `saved_inputs`/
`saved_input_versions`/`attachments`, `runs`) is now live on the
production Postgres database.

**Up next:** Per Josh's explicit direction, the next phase is **auth**
(`bootstrap:add-auth` skill — single-user Supabase email/password,
`/login` route, guarded `/dashboard`) — deliberately sequenced *before*
`docs/PLAN.md` Phase 2 (the AI provider layer, which wires in
server-side API keys), since the app is currently public with zero
auth gate.
