# prompt-smith

> A prompt (or system prompt) plus a complaint in, an improved version out — it fixes exactly what you flag.

**Status: planned, direction pivoted (2026-07-03)** — see [`docs/PIVOT.md`](docs/PIVOT.md) for the current design. The "complaint-driven prompt fixer" description below is the superseded framing, kept as history rather than deleted.

---

## What this will be

A focused, **agent-first**, BYO-key utility that improves a prompt against a stated problem. "Too verbose, too many canned phrases, bland image results" → it fixes that. Loop: improve → check against the complaint *and* the `/knowledge` rubric → revise until satisfied.

The verifier comes from two honest sources: **your complaint** (a checkable standard anchored to a real defect) and **the `/knowledge` folder** (the always-on baseline of what good prompt-craft looks like). The most fun file is `anti-patterns.md` — a living blocklist of phrases that produce mush; the app literally gets better as you grow it.

Full brief: [`docs/SPEC.md`](docs/SPEC.md) · umbrella vision: [`docs/OVERVIEW.md`](docs/OVERVIEW.md).

## Boundary (the lane is welded)

Improves a prompt against a problem. Not a prompt library, not a chat playground, not a model benchmark suite. Retune *what good prompt-craft means* via `/knowledge` only.

## Two depths (build the shallow one first)

- **v1 — complaint-driven:** prompt + complaint in, improved prompt out, judged against the complaint + `/knowledge`.
- **Later — optimizer:** the system prompt becomes the thing optimized against a held-out test set; watch the score climb. Downstream, only if v1 earns it.

## Stack

TanStack Start (Vite-plugin model) · React 19 · TypeScript (strict) · Tailwind v4 · Vitest · ESLint + Prettier · pnpm. Deploys to Vercel.

## Local development

```bash
pnpm install
pnpm dev      # http://localhost:3002
pnpm build    # production build
pnpm test     # vitest
pnpm lint
```
