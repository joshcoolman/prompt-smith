# Railway settings drift unless they're in `railway.json`

## What happened here

Auditing the Railway setup turned up a service that built and deployed
fine but whose configuration existed _only_ in the dashboard — nothing in
the repo recorded any of it. The load-bearing one was the Pre-Deploy
Command, `pnpm db:migrate:deploy`. Migrations ran on every deploy because
of a field someone set in a web UI months earlier. Recreate the service,
or add a `staging` environment, and migrations silently stop running —
the app boots against a stale schema and fails at query time, far from
the cause.

Fixed by adding `railway.json` at the repo root. Railway reads
config-as-code and it takes precedence over dashboard values, so builder,
start command, pre-deploy command, restart policy, region, and replica
count are now versioned.

## What stays in the dashboard on purpose

- **Secrets** — `ANTHROPIC_API_KEY`, Supabase keys, and `DATABASE_URL`'s
  `${{...}}` service reference. The _contract_ is versioned in
  `.env.example`; the values must not be.
- **Public domain** and the **repo↔service link** — bootstrap facts about
  how the service was provisioned, not per-deploy config.

## Note

No Dockerfile is involved. Railway uses Railpack, which infers the build
from `package.json`. Docker's only role in this repo is the local
Postgres container (`docker-compose.yml`) — the app itself never runs in
a container locally.
