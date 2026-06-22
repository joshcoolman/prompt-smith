# prompt-smith — working notes for Claude

**Read first:** [`docs/SPEC.md`](docs/SPEC.md) (high-level sketch — flesh out during the build) and [`docs/OVERVIEW.md`](docs/OVERVIEW.md) (the umbrella vision).

## Hold the line

- **Agent-first, not agent-added.** The agent is the product; the UI serves its loop.
- **The boundary is welded.** Prompt + complaint in → improved prompt out. Not a prompt library, chat playground, or benchmark suite. Retune *what good prompt-craft means* via `/knowledge` only.
- **Mechanism vs knowledge.** The improve→check→revise loop is mechanism (code). What "good" means lives in `/knowledge`: `prompt-craft.md`, `anti-patterns.md` (a living blocklist), `rubric.md`.
- **Verifier:** two sources — the user's stated complaint (ground truth) and the standing `/knowledge` rubric (always-on baseline).
- **Build the shallow depth first:** complaint-driven v1. The optimizer (held-out test set, watch the score climb) is the capstone, downstream only.
- **Data model:** clean, addressable records with stable IDs (MCP-ready later).

## Current state

Scaffold only (TanStack Start + React 19 + TS + Tailwind v4 + Vitest). Planned — real work starts after palette-forge ships, reusing its proven patterns. Status landing in `src/components/status-landing.tsx`, driven by `src/app-meta.ts`.
