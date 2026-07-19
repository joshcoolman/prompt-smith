# Feature: knowledge

## What this owns

Reading `knowledge/*.md` from the repo root and handing the contents to
whatever needs them, as a plain string. That is the entire responsibility.

## What it does NOT own

The content itself. Knowledge files are plain markdown, deliberately editable
by a non-coder without touching code — the mechanism stays here, the taste
stays in `knowledge/`.

## Key design decisions

- **Server-only, always.** This module imports `server-only`, so if any Client
  Component ever imports it — even transitively — the build fails loudly with a
  clear error instead of trying to ship `node:fs` into a browser bundle.
  Anything downstream that reads knowledge must therefore live in a Server
  Component, Route Handler, or Server Action, or receive the already-read string
  as an argument from something that does.
- **The universal provider.** Every feature may import from here. This is the
  one exception to feature isolation.

## Where to read more

`docs/PLAN.md`.
