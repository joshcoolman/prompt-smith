# Discussions

Running record of what has been explained and what is still open.

Covered topics are compressed to recall-level on purpose — enough to remember
the concept cold, not enough to re-teach it. If a note starts growing into an
explanation, the fact probably belongs in `SPEC.md` or `CLAUDE.md` instead.
This file records that something was understood; the other docs record what
the app does.

## Next up

→ Multiple Postgres services: when and why you'd have more than one

## Open

- [ ] Multiple Postgres services: when and why
- [ ] Multi-user vs single-user — is login per-user, and how would per-user
      visibility work in the schema
- [ ] Adding a table with a dependency (favorites) — the mid-development
      migration workflow, with simple Drizzle examples
- [ ] Local setup → live, end to end, as a command sequence
- [ ] Provisioning a sandbox for an agent on Railway (write and execute code,
      basic bash, isolated)
- [ ] Throwaway test run: scaffold → run locally → deploy → tear down

## Covered

### Railway concepts

**Egress / ingress.** Egress is data leaving the network, and it is billed
(~$0.05/GB). Ingress is data coming in, and it is free. Traffic between
services over `*.railway.internal` never leaves Railway at all, so it is also
free — which is why app→database uses the internal hostname rather than the
public one.

**Provisioning Postgres.** A service running the official Postgres image with
a persistent volume attached (the volume is the disk; it survives redeploys).
Created via the dashboard, `railway add --database postgres`, or MCP.
Provisioning gives you a running database and a connection string. It does
**not** create tables — the database comes up empty. That's what migrations
are for.

**Two services, connected by configuration.** The web service and the Postgres
service are separate containers with separate lifecycles. They're linked only
by a variable: the app's `DATABASE_URL` points at
`postgres.railway.internal`. Nothing in the codebase names Postgres, so
swapping that string points the app at a different database with no rebuild.

**Public database access.** Optionally, Postgres gets a TCP proxy hostname on
a different port (internal is 5432; the proxy assigns another). It's a real
Postgres connection — psql, TablePlus, Drizzle Studio all work. Protected only
by the password, with no IP allowlist, so it's off by default. Fine for
inspecting production; never what the app itself uses.

**Common service types.** Redis, object-storage buckets (S3-compatible),
background workers, cron services, Functions. A WebSocket server isn't a
distinct type — it's a normal web service holding connections open. The
general rule: you add a service when work shouldn't share a lifecycle with the
web server.

### This app

**Postgres is provisioned but completely unused.** It's left over from the
pre-rebuild Vite app. Nothing in the codebase reads `DATABASE_URL`, and no
database packages are installed at all. The app reads exactly three env vars —
`AUTH_USERS`, `AUTH_SESSION_SECRET`, `NODE_ENV` — all in the auth feature.
`ANTHROPIC_API_KEY` is also set and also unread so far.

**Auth needs no provisioned resource.** Credentials live in the `AUTH_USERS`
env var (scrypt hashes), and the session is a signed stateless cookie. No user
table, no session table, no vendor. This is why the app would run identically
today with Postgres deleted. Postgres becomes load-bearing at Phase 1.

**Local vs Railway is one string.** Same code both places. Locally `pnpm dev`
runs `next dev` and reads `.env.local`; on Railway `pnpm start` runs
`next start` against a built image and reads service variables. The old app
ran a local Postgres in Docker for development, separate from production's.
