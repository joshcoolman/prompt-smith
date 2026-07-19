# Overview

## The problem

A system prompt is only as good as the last time you compared it to an
alternative. Editing a prompt in a chat window destroys the version you were
comparing against, and running it in one model tells you nothing about how it
behaves in another. The work of getting a persona right — tightening it,
cutting it, testing whether a paragraph is carrying its weight — has no
workspace.

## The app

prompt-smith is a self-hosted, single-user playground for that work.

**Project → Persona (versioned system prompt) × Saved Input (versioned user
prompt + optional attachments) × Model → Run → raw output, compared side by
side, judged by eye.**

Everything is append-only. Editing a persona inserts a new version rather than
overwriting the old one, because you cannot compare v1 against v2 if editing
destroyed v1. Runs pin the exact persona version and input version they used,
so history stays honest.

## Where it fits

It is a standalone tool, not a component. A finished persona leaves the way any
artifact leaves: copy-paste into whatever app consumes it. There is no export
machinery, no sync, no live coupling to a host app.

## What it is deliberately not

- **Not an evals or scoring platform.** No LLM-as-judge, no metrics, no
  leaderboards. Comparison is by eye.
- **Not nested inside a host app.** An earlier design cloned prompt-smith as a
  gitignored sibling folder inside a consuming repo. That was rejected — it
  drags prompt-smith's dev server and folder conventions into every project
  that touches it.
- **No domain-specific output rendering.** Raw text and markdown, not palette
  swatches or product-photo layouts.

That last boundary is the load-bearing one, and `SPEC.md` records the reasoning
behind it.
