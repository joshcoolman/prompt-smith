# prompt-smith — working notes for Claude

**Read first:** [`docs/PLAN.md`](docs/PLAN.md) (the concrete, decided build
plan — the _how_ and the build order). Then [`docs/SPEC.md`](docs/SPEC.md) (the
_what/why_ sketch) and [`docs/OVERVIEW.md`](docs/OVERVIEW.md) (the umbrella
vision). All docs are viewable in-app at `/docs`.

## The boundary (welded)

- **The boundary is welded.** Prompt + complaint in → improved prompt out. Not a prompt library, chat playground, or benchmark suite. Retune _what good prompt-craft means_ via `/knowledge` only.
- **Mechanism vs knowledge.** The improve→verify→revise loop is mechanism (code). What "good" means lives in `/knowledge`: `prompt-craft.md`, `anti-patterns.md` (a living blocklist), `rubric.md`.
- **Verifier:** two sources — the user's stated complaint (ground truth) and the standing `/knowledge` rubric (always-on baseline).
- **Build the shallow depth first:** one-pass complaint-driven v1 (Phase 1). The verify loop (Phase 2) and optimizer (Phase 4) are downstream only.

## Current state — Phase 0 complete

Runnable shell with the full baseline in place:

- **Shell:** empty home (`src/components/home.tsx`); in-app markdown docs viewer
  at `/docs` (`src/routes/docs.tsx`, react-markdown). `pnpm dev` → :3002.
- **Rails:** feature seams under `src/features/` (`improve`, `generate`,
  `verify`, `knowledge`, `prefs`), each with a `CLAUDE.md`. Core contracts in
  `src/features/improve/types.ts`: `PromptRecord`, `PromptVerdict`, `PromptIssue`.
- **Knowledge:** `knowledge/prompt-craft.md`, `anti-patterns.md`, `rubric.md`.
- **Plan:** `docs/PLAN.md` is the build order a coding agent executes against.

## Style system

Paper & Ink global styles in **`src/styles/`** — see [`docs/STYLE.md`](docs/STYLE.md).
Token-based Tailwind utilities: `bg-surface`, `text-muted`, `font-serif`, etc.
Feature styles never go in `src/styles/` — use Tailwind utilities in components
or a co-located `features/<x>/<x>.module.css`.

**Next:** Phase 1 — the one-pass vertical. See `docs/PLAN.md`.
