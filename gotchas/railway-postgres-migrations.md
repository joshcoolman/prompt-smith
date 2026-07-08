# Railway + Postgres: run migrations automatically

Full playbook: `bootstrap/gotchas/railway-postgres-migrations.md`
(canonical — update it there if this ever needs a correction, not here).

## What happened here

Set Railway's Pre-Deploy Command on the `prompt-smith` service to
`pnpm db:migrate:deploy` (runs `scripts/migrate.mjs`, a plain-JS runner —
no `drizzle-kit` needed at runtime). Confirmed working in the deploy log
for deployment `6bb98169`: `$ node scripts/migrate.mjs` →
`Migrations applied`, before the app container started.
