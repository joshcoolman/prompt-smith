# Feature: core

## What this owns

The domain: the four nouns (Project, Persona, Saved Input, Run) and the
orchestration seam that sequences a run. It holds the primary record types and
the append-only versioning rules.

## What it does NOT own

- The provider call itself — that is a thin `callModel` adapter, its own seam.
- Domain taste (what a good persona looks like) — that lives in `knowledge/` as
  markdown, loaded by the `knowledge` feature.
- Auth — `src/features/auth`.

## Key design decisions

- **Records, not React state.** A run is a row with a status, not a component's
  loading flag. The UI reads records.
- **Append-only versioning.** Editing a persona or saved input inserts a new
  version row. Nothing overwrites. Runs pin the exact version ids they used.
- **Thin orchestrator.** Sequencing only — no provider logic and no prompt
  assembly of its own.

## Where to read more

`docs/SPEC.md` (the data model and the scope boundary), `docs/PLAN.md` (build
order). Nothing is implemented here yet — Phase 1 is where this folder gets
real.
