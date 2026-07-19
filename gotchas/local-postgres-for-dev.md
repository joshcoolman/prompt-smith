# Local dev needs its own Postgres

Full playbook: `bootstrap/gotchas/local-postgres-for-dev.md` (canonical —
update it there if this ever needs a correction, not here).

## What happened here

Manually verifying Phase 3 (`docs/PLAN.md`) in the browser hit
`Failed query: select ... from "projects"` — nothing was listening on
`localhost:5432`. Railway's Postgres is private-network-only (no public
port), so it's unreachable from a laptop even with `railway run`.
Spun up a disposable `postgres:16-alpine` container matching
`.env.local`'s existing (placeholder) `DATABASE_URL`, then ran
migrations with `node --env-file=.env.local scripts/migrate.mjs` (plain
`node scripts/migrate.mjs` doesn't load `.env.local` the way `pnpm dev`
does). `docker-compose.yml` added for a repeatable version — see the
"Local development" section of `README.md`.

## Follow-up: collapsed to one command

The four-step sequence above was the reason local dev felt like a chore,
and the migration step was the worst of it — undiscoverable (documented
only here) and failing as an opaque query error rather than anything that
named the cause. Now `pnpm dev:local` does the whole thing: `docker
compose up -d --wait` (blocking on a `pg_isready` healthcheck added to
`docker-compose.yml`, so migrations can't race container startup) →
`pnpm db:migrate:local` → `pnpm dev`. Idempotent, so it's safe to run
every session regardless of what's already up.
