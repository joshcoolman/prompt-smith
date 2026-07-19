# prompt-smith

## What this app is

A self-hosted, single-user multi-model prompt/persona playground.

**Project → Persona (versioned system prompt) × Saved Input (versioned user
prompt + optional attachments) × Model → Run → raw output, compared side by
side, judged by eye.**

## Read first

1. `docs/SPEC.md` — the data model and, more importantly, the **scope
   boundary**. prompt-smith is not an evals platform, is not nested inside a
   host app, and does not render domain-specific output. That boundary was
   arrived at by rejecting a design that had already been built; do not
   re-litigate it from scratch.
2. `docs/PLAN.md` — build order and what is runnable at each phase.
3. GitHub issues #16–#22 — the authoritative backlog detail.

## Current phase

**Phase 0 complete.** This is a fresh scaffold on the `bootstrap` Next.js
starter, replacing a previous Vite + TanStack Start + Supabase implementation
whose code still lives in git history on `main`.

What exists: the shell, Paper & Ink styles, self-hosted allowlist auth,
deny-by-default route protection, the `/docs` viewer, feature seams, CI.
`/dashboard` is empty and is where Phase 1 gets built.

What does not exist yet: any of the domain. No database, no schema, no provider
call, no runs.

## Stack decisions that are settled

- **Next.js App Router only.** No Vite.
- **Self-hosted allowlist auth.** No Supabase — its free tier caps at two
  projects, which is the constraint that started the rebuild.
- **No Effect.** Model calls go through a thin `callModel` adapter this repo
  owns. See issue #22 for the full reasoning, recorded so it is not re-adopted
  on a vague recommendation.

## Layout

```
src/
  app/         App Router tree — page, login, dashboard, docs
  proxy.ts     deny-by-default middleware (Edge; imports auth/session directly)
  features/
    auth/      session, credentials, actions — see its CLAUDE.md
    core/      the four nouns and orchestration — empty, Phase 1
    knowledge/ server-only loader for knowledge/*.md
    docs/      markdown classification for the /docs viewer
  styles/      Paper & Ink — frozen baseline, treat as read-only
knowledge/     plain markdown, tunable without touching code
docs/          OVERVIEW / SPEC / PLAN / STYLE
```

## Conventions

- pnpm, not npm.
- No emoji anywhere — codebase, docs, or UI.
- Feature styles never go in `src/styles/`. Use token-based Tailwind utilities,
  or a co-located `*.module.css`.
- `src/proxy.ts` must import `#/features/auth/session` directly, never the auth
  barrel — the barrel pulls in `node:crypto` and breaks the Edge bundle.

## Commands

```
pnpm dev                              # localhost:3040
pnpm build                            # also the full type-check
pnpm test
pnpm lint
pnpm auth:add-user '<email>' '<pw>'   # prints an AUTH_USERS entry
```
