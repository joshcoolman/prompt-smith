## Git workflow — milestone PRs (overrides global no-PR default)

This repo wants clean, milestone-based history: **branch → PR → merge**,
not direct pushes to `main`. This overrides the global `~/.claude/CLAUDE.md`
solo-dev "direct push" default for this repo specifically. One unit of
work = one branch = one PR, merged when the unit is done (e.g. "Railway
infra," "Drizzle schema"). Use `gh pr create` / `gh pr merge --delete-branch`.
Still no need to ask before merging your own PRs — just do the branch → PR
→ merge cycle per milestone.

# prompt-smith — working notes for Claude

**Read first:** [`docs/VISION.md`](docs/VISION.md) — 2026-07-07 direction change, current authority. It supersedes `docs/PIVOT.md` (2026-07-03), which in turn supersedes the "Hold the line" section below and the framing in `docs/SPEC.md` / `docs/OVERVIEW.md`. The full chain is kept as history, not deleted. Reconcile before resuming work here.

## Hold the line (superseded — see PIVOT.md)

- **The boundary is welded.** Prompt + complaint in → improved prompt out. Not a prompt library, chat playground, or benchmark suite. Retune _what good prompt-craft means_ via `/knowledge` only.
- **Mechanism vs knowledge.** The improve→verify→revise loop is mechanism (code). What "good" means lives in `/knowledge`: `prompt-craft.md`, `anti-patterns.md` (a living blocklist), `rubric.md`.
- **Verifier:** two sources — the user's stated complaint (ground truth) and the standing `/knowledge` rubric (always-on baseline).
- **Build the shallow depth first:** one-pass complaint-driven v1 (Phase 1). The verify loop (Phase 2) and optimizer (Phase 4) are downstream only.

## Current state — Phase 0 shell complete, direction re-envisioned

The Phase 0 runnable shell is still in place, but it was built for the old
complaint-driven-fixer direction, now superseded by `docs/VISION.md`. No
application code has changed to match the new direction yet — this is a
docs-only re-envisioning pass.

- **Shell:** empty home (`src/components/home.tsx`); in-app markdown docs viewer
  at `/docs` (`src/routes/docs.tsx`, react-markdown). `pnpm dev` → :3002.
- **Rails (superseded):** feature seams under `src/features/` (`improve`,
  `generate`, `verify`, `knowledge`, `prefs`), each with a `CLAUDE.md` pointing
  at `docs/VISION.md` — they belonged to the old mechanism and are retired.
  Core contracts in `src/features/improve/types.ts`: `PromptRecord`,
  `PromptVerdict`, `PromptIssue` — left untouched, unused.
- **Knowledge (historical):** `knowledge/prompt-craft.md`, `anti-patterns.md`,
  `rubric.md` — see `docs/VISION.md`'s `/knowledge` folder note.
- **Plan:** `docs/PLAN.md` has been rewritten with a new phased build order
  (Railway + Postgres + Drizzle first); the old Phase 1-4 are kept below it
  as history.

## Style system

Paper & Ink global styles in **`src/styles/`** — see [`docs/STYLE.md`](docs/STYLE.md).
Token-based Tailwind utilities: `bg-surface`, `text-muted`, `font-serif`, etc.
Feature styles never go in `src/styles/` — use Tailwind utilities in components
or a co-located `features/<x>/<x>.module.css`.

**Next:** Phase 1 — Railway + Postgres + Drizzle infra. See `docs/PLAN.md`.
