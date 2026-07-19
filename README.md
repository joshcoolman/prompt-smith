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

Railway's Postgres is private-network-only (no public port), so it isn't
reachable from a laptop — local dev needs its own disposable Postgres
(`docker-compose.yml`). See `gotchas/local-postgres-for-dev.md`.

Start Docker Desktop, then:

```bash
pnpm install
pnpm dev:local   # http://localhost:3002
```

`dev:local` is the whole loop in one command: brings up the Postgres
container and waits for it to accept connections (`--wait`, backed by the
healthcheck in `docker-compose.yml`), applies any pending migrations, then
starts Vite. It's idempotent — safe to run every session, whether or not
the container is already up or migrations are already applied.

`.env.local`'s `DATABASE_URL` must match the container
(`postgresql://user:devpassword@localhost:5432/prompt_smith`); `pnpm
setup:supabase` writes the rest.

```bash
pnpm dev:local:stop   # stop the Postgres container (data survives in a volume)
pnpm dev              # Vite only, if Postgres is already up
pnpm db:migrate:local # migrations only
pnpm build            # production build
pnpm test             # vitest
pnpm lint
```

## Railway configuration

Build and deploy settings live in `railway.json` (config-as-code), which
takes precedence over the dashboard — so the pre-deploy migration step,
start command, region, and replica count are versioned here rather than
being invisible dashboard state. What deliberately stays in the dashboard:
secrets (`ANTHROPIC_API_KEY`, the Supabase keys, `DATABASE_URL`'s service
reference — see `.env.example` for the contract), the public domain, and
the repo↔service link.

## Status

**Last shipped:** Local dev loop collapsed to one command, and Railway
config pulled into the repo. `pnpm dev:local` now brings up Postgres
(healthcheck + `--wait`), migrates, and starts Vite — replacing a
four-step sequence whose migration step lived only in a gotcha file and
failed as a confusing query error. `railway.json` versions the build and
deploy settings that previously existed only in the dashboard — most
importantly the pre-deploy `pnpm db:migrate:deploy`, which nothing in the
repo recorded. Verified end to end: container healthy, migrations
idempotent against the existing volume, app 200s on `/` and `/login`,
10/10 tests, clean production build.

**Before that:** Core UI (`docs/PLAN.md` Phase 3) — the full loop now works
in the browser. `/` lists Projects (create/delete); `/projects/$projectId`
is one workspace page with Personas, Saved Inputs (both versioned — every
edit inserts a new version, never overwrites), and a Run panel that picks a
persona version × saved input version × model and calls Anthropic via a new
`createServerFn` (`src/features/runs/`, `src/features/projects/`) — a
second, simpler in-app path alongside the bearer-gated `/api/run` from
Phase 2, both calling the same `runAnthropicCompletion`. Verified live in
the browser: created a project/persona/saved input, ran it for real output,
edited the persona to a v2, and confirmed picking v1 vs v2 in the Run panel
changes the actual model output. Saved Inputs are text-only this phase —
attachment upload is a deliberate fast-follow, not done here. Local
verification needed its own Postgres (Railway's is private-network-only);
added `docker-compose.yml` and `gotchas/local-postgres-for-dev.md` so a
future session doesn't hit the same wall. Run output now renders as
markdown (`react-markdown`), and the workspace layout is a left sidebar
(controls: Personas, Saved Inputs, Run form) + right column (output/History).

**Deploy status:** Production on Railway (`prompt-smith-production.up.railway.app`)
is caught up with all of the above as of this session — confirmed via a
real deploy, not just a merge. Along the way, found and fixed a real build
break: `msgpackr-extract` (pulled in transitively by Phase 2's
`@effect/platform`) needed a pnpm build-script approval
(`pnpm-workspace.yaml`'s `allowBuilds`) — see
`gotchas/pnpm-install-approvals.md`. Auto-deploy is **on**, watching
`main` — safe here because this repo's workflow is exclusively
branch → PR → merge, so every push to `main` is already a completed,
reviewed milestone.

**Up next:** `docs/PLAN.md` Phase 4 — side-by-side comparison: the same
input run across multiple models and/or persona versions in parallel.
Also outstanding: attachment upload (image/PDF Saved Inputs), scoped out
of Phase 3.
