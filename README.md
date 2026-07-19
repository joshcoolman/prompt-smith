# prompt-smith

A self-hosted, single-user multi-model prompt and persona playground.

**Project → Persona (versioned system prompt) × Saved Input (versioned user
prompt + optional attachments) × Model → Run → raw output, compared side by
side, judged by eye.**

Everything is append-only: editing a persona inserts a new version rather than
overwriting, because you cannot compare v1 against v2 if editing destroyed v1.

It is deliberately not an evals or scoring platform, not a component nested
inside a host app, and does not render domain-specific output. See
`docs/SPEC.md` for the reasoning.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 via PostCSS — the Paper & Ink design system in `src/styles/`
- Vitest + React Testing Library
- Deployed on Railway

## Auth

Self-hosted and **allowlist-shaped**. There is no signup route, no password
reset, no OAuth, and no roles. Passwords are scrypt-hashed; the session is a
signed, stateless cookie — no database involved.

Access is granted out-of-band:

```bash
pnpm auth:add-user 'someone@example.com' '<password>'
```

That prints an `email:salt:hash` entry. Paste it into `AUTH_USERS` (comma-
separated for multiple people) in `.env.local` and on the host, then redeploy.
Removing access is deleting the entry.

Because sessions are stateless there is **no server-side revocation**. Signing
out clears the cookie in that browser; changing `AUTH_SESSION_SECRET`
invalidates every session everywhere at once.

Every route requires a session except `/login` — including `/docs`.

## Local development

```bash
pnpm install
cp .env.example .env.local     # then fill in the two auth vars
pnpm dev                       # http://localhost:3040
```

Generate `AUTH_SESSION_SECRET` with `openssl rand -hex 32`, and `AUTH_USERS`
with `pnpm auth:add-user` as above.

```bash
pnpm build    # production build; also the full type-check
pnpm test
pnpm lint
```

The app builds and boots with zero env vars set — it just cannot sign anyone in.

## Docs

`/docs` in the running app renders everything in `docs/` and `knowledge/`, plus
this README and `CLAUDE.md`.

## Status

**Last shipped — Phase 0, the rebuild scaffold (2026-07-18)**

- Rebuilt from scratch on the `bootstrap` Next.js scaffold, replacing the
  previous Vite + TanStack Start + Supabase implementation (still in git
  history on `main`).
- Self-hosted allowlist auth replacing Supabase, with deny-by-default
  middleware. Login, session persistence, and sign-out verified in a browser.
- Paper & Ink design system, `/docs` viewer, feature seams, CI. Build, lint,
  and tests green with zero env vars.
- `/dashboard` is intentionally empty — that is where the app gets built.

- **Live in production** at
  [prompt-smith-production.up.railway.app](https://prompt-smith-production.up.railway.app).
  Railway rewired for Next.js: `railway.json` updated, `AUTH_SESSION_SECRET`
  and `AUTH_USERS` set, the three Supabase vars deleted. Sign-in and route
  gating verified on the live site, not just locally.

**Deploy notes worth keeping**

Five consecutive deploys failed before one succeeded, and none of the failures
said what was wrong in an obvious place:

- `pnpm-workspace.yaml` needs a `packages` field once it exists, or pnpm
  versions before 11 abort. Local pnpm was 11 and Railway's was not, so the
  install passed locally and failed on deploy. `packageManager` in
  `package.json` now pins pnpm everywhere, which removes the class.
- `railway.json` is an **override layer**, not a full description of the
  service. Omitting `preDeployCommand` does not disable it, and neither does
  setting it to `[]` — both read as "unset" and fall back to the last value.
  Only a different, succeeding command replaces it, so it is a no-op `echo`
  until Phase 1 restores migrations.
- The Railway API returned **no build logs at all** for the early failures.
  When a deploy fails with nothing useful from `railway logs` or the MCP, read
  the deployment in the dashboard — the error was only ever visible there.

**Up next**

- Phase 1, the data model (#16): four nouns with append-only versioning. The
  previous implementation's `src/db/schema.ts` was verified working and is
  worth lifting close to verbatim from git history.
- Restore a real `preDeployCommand` when migrations exist — see the reminder in
  `docs/PLAN.md`, and turn on Postgres backups at the same time, since that is
  the point where there is finally data worth losing.
- Then the run loop (#18, #22), then side-by-side comparison (#19) — the actual
  point of the app, and the phase the previous implementation never reached.

See open issues #16–#22 for the backlog.
