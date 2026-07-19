# Plan

Build order. Each phase names what is runnable when it is done. The backlog
lives in GitHub issues; the issue numbers below are the authoritative detail.

## Phase 0 — Scaffold (done)

Next.js App Router shell, Paper & Ink styles, self-hosted allowlist auth,
deny-by-default route protection, `/docs` viewer, feature seams, CI.

**Runnable:** the app boots, `/login` works, `/dashboard` is gated and empty.

## Phase 1 — Data model (#16)

Four nouns with append-only versioning: Project, Persona, Saved Input, Run.
Postgres via Drizzle. The previous implementation's `src/db/schema.ts` was
verified working and is worth lifting close to verbatim — find it in git
history on `main`, before the rebuild.

**Runnable:** projects, personas, and saved inputs can be created and edited,
with every edit producing a new version rather than overwriting.

**Do not forget:** `railway.json` currently has **no** `preDeployCommand`. The
pre-rebuild config ran `pnpm db:migrate:deploy` there, and it was dropped
because no migrations exist yet — left in, it would fail every deploy. Restore
it as part of this phase, or production will boot against a stale schema with
nothing warning you.

## Phase 2 — Run loop (#18, #22)

Pick a persona version × a saved input version × a model; call the provider
server-side through a thin `callModel` adapter; persist the run with status
(`pending` / `running` / `success` / `error`), output, and error; render the
output as markdown.

**Acceptance check, and it is the app justifying its own existence:** create a
project, persona, and saved input; run it for real output; edit the persona to
a v2; then confirm that picking v1 vs v2 in the run panel *changes the actual
model output*.

## Phase 3 — Side-by-side comparison (#19)

The actual point of the app, and the phase the previous implementation never
reached. The same input run across multiple models and/or multiple persona
versions, displayed next to each other.

**Runnable:** two or more outputs held side by side, differences visible at a
glance.

## Phase 4 — Multimodal attachments (#20)

Image and PDF attachments on saved input **versions**, stored in object storage
(Railway Bucket / S3 API), shaped per provider at call time.

## Open questions (#21)

Not blocking, recorded so they are not rediscovered from scratch: is a compiled
persona one concatenated string or separate message roles; do golden-set bulk
runs need a queue; are composable persona blocks worth it for ablation, or does
version history already cover enough.
