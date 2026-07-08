# prompt-smith

> A self-hosted, multi-model prompt & persona playground — save inputs and personas, compare raw output across vendors, side by side.

**Status: direction re-envisioned (2026-07-07)** — see [`docs/VISION.md`](docs/VISION.md) for the current design. `docs/PIVOT.md` and the "complaint-driven prompt fixer" description below are superseded framing, kept as history rather than deleted.

---

## What this was (superseded — see VISION.md)

A focused, **agent-first**, BYO-key utility that improves a prompt against a stated problem. "Too verbose, too many canned phrases, bland image results" → it fixes that. Loop: improve → check against the complaint _and_ the `/knowledge` rubric → revise until satisfied.

The verifier comes from two honest sources: **your complaint** (a checkable standard anchored to a real defect) and **the `/knowledge` folder** (the always-on baseline of what good prompt-craft looks like). The most fun file is `anti-patterns.md` — a living blocklist of phrases that produce mush; the app literally gets better as you grow it.

Full brief: [`docs/SPEC.md`](docs/SPEC.md) · umbrella vision: [`docs/OVERVIEW.md`](docs/OVERVIEW.md) · pivot: [`docs/PIVOT.md`](docs/PIVOT.md).

### Boundary (the lane is welded)

Improves a prompt against a problem. Not a prompt library, not a chat playground, not a model benchmark suite. Retune _what good prompt-craft means_ via `/knowledge` only.

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

**Last shipped:** Auth (`docs/PLAN.md` Phase 1.5), via the `bootstrap:add-auth`
skill. Single shared-credential Supabase gate — `/` is now the protected
dashboard (redirects signed-out visitors to `/login?redirect=…` and back);
`/docs` stays public. Vendor-agnostic `AuthClient` seam in
`src/features/auth/` (Supabase is the only adapter; a mock adapter proves the
contract in tests with zero env vars). Confirmed live in production on
Railway (env vars pushed, redeployed, signed in successfully) — not just
locally.

Also resolved: the Railway build blocker from `pnpm-workspace.yaml`'s dead
`onlyBuiltDependencies` key (pnpm v11 renamed it `allowBuilds`), and
automatic DB migrations via Railway's Pre-Deploy Command
(`pnpm db:migrate:deploy`, confirmed running before every deploy). Full
detail in `gotchas/`.

**Up next:** `docs/PLAN.md` Phase 2 — the Effect AI provider layer (a backend
endpoint: persona + input + model choice → raw output, provable via
curl/script, no UI yet). Two decisions already settled, ready for a fresh
session to build against without re-litigating:

- **API keys live in Railway env vars** (e.g. `ANTHROPIC_API_KEY`), same
  pattern as the Supabase keys — not a settings table. Revisit only if a
  real need for in-app key rotation shows up.
- **Anthropic is the first provider** (`@effect/ai-anthropic`) — prove one
  real multimodal call end-to-end before adding a second adapter.

Not yet researched: `@effect/ai`'s current API surface (the Effect
ecosystem moves fast — verify against real docs, not memory, before
writing the provider layer).
