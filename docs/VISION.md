# prompt-smith — vision (2026-07-07)

> Supersedes `docs/PIVOT.md`'s delivery model ("nested, never coupled") and
> sequencing. The persona/knowledge-as-composable-idea and the
> mechanism-vs-knowledge distinction are reconsidered below, not simply
> carried forward. `PIVOT.md` is left in place as history, not deleted —
> reconcile it before resuming work here.

## What changed and why

`PIVOT.md` proposed a nested drop-in: prompt-smith cloned as a sibling
folder inside a host repo, gitignored, with a freeze/export step to snapshot
a finished persona into the host's own tracked files. Working through what
that actually required to build surfaced two problems.

First, the coupling risk. Even gitignored and freeze/exported rather than
live-synced, a nested-repo model pulls prompt-smith's dev server, its
folder conventions, and its assumptions about the host's `knowledge/`
layout into every project that wants to use it. That's exactly the kind of
premature coupling the pivot itself was trying to escape — it just moved
the coupling from "shared runtime state" to "shared repo layout."

Second, and more fundamental: the real "aha" from palette-forge's own dev
toolbar wasn't the nesting — it was being able to save a persona and a
test input, reload them, tweak one, and immediately see the effect. That
needs personas and inputs to be **savable, reloadable, and organized**. It
does not need any mechanism for pulling a persona out of one repo and into
another; a finished persona leaves a project the same way any other
artifact does — copy-paste.

Third, the real "uh-oh": a persona's quality can only be judged in the
context that actually consumes it — a rendered palette, a moderated image,
a generated product photo. A standalone tool cannot replicate that
context, and trying to (e.g. by teaching prompt-smith to render a palette
preview) would turn it into a bad, permanently-lagging clone of every host
app it might ever serve. The honest, containable slice a standalone tool
*can* own is raw text/multimodal output, compared side by side, judged by
eye. Anything past that belongs in the host app, not here.

**Projects** replace "app within an app" as the organizing unit. Each
project starts empty and holds its own personas, saved inputs, and runs —
no relationship to any other repo, nested or otherwise.

## What prompt-smith is now

A standalone, self-hosted, opinionated multi-model prompt/persona
playground. [text + image + PDF] in, raw output out, across whichever
models and personas you choose, judged by eye.

It is explicitly **not**: a prompt library, a nested dependency of another
project, or an evals/scoring platform. It doesn't try to reproduce what a
consuming app does with the output — it shows you the output.

## The core loop

Project → Persona (a versioned system prompt) × Saved Input (a user prompt
plus optional attachments — a single example or a golden set) × Model →
Run → raw output, shown side by side against other runs.

## Data model (the four nouns)

- **Project** — the top-level container. Starts empty; everything below
  belongs to exactly one project.
- **Persona** — a system prompt. Versioned — every edit is a new version,
  not an overwrite.
- **Saved Input** — a user prompt plus optional attachments (image/PDF).
  Versioned the same way as a Persona. Can be a single example or grouped
  into a golden set for bulk runs later.
- **Run** — one persona version × one saved input × one model, producing
  raw output. The unit that gets compared side by side.

## What it explicitly does NOT do

- No scoring or LLM-as-judge automation — comparison is by eye, not by
  metric.
- No domain-specific output rendering (a palette swatch, a moderation
  verdict, a product photo layout) — that stays in the host app that
  actually consumes the persona.
- No live coupling to any other repo — hand-off is copy-paste of a
  finished persona/prompt, same as any other artifact, not export
  machinery or a sync mechanism.
- No multi-tenant accounts — self-hosted, single-user. Anyone who wants
  their own copy deploys their own instance.

## Tech stack (opinionated, vendor-forward by design)

- **Frontend:** TanStack Start + React 19 + Tailwind v4 (Paper & Ink style
  system) — unchanged, keep the existing scaffold.
- **LLM orchestration:** [`@effect/ai`](https://effect.website), with
  provider layers (`@effect/ai-anthropic`, `@effect/ai-openai`, ...)
  swappable under one interface. Native multimodal vision input and
  type-safe tool calling, so vendor-hopping and per-provider image/PDF
  input-shaping are solved by the library, not hand-rolled per provider.
- **Validation:** `@effect/schema` at every boundary — persona/input/run
  records, model output shapes.
- **Data:** Postgres via Drizzle ORM. Projects/Personas/Inputs/Runs are
  real relational, versioned data, not IndexedDB records.
- **File storage:** attachments (images/PDFs) on a Railway volume,
  persisted across deploys.
- **Backend:** a persistent Node server (`@effect/platform-node`) fronting
  Postgres and the model providers. API keys live server-side (env var or
  a settings table) — never in browser storage.
- **Hosting:** Railway — an app container plus Postgres (private network,
  no public port) plus a volume, deployed via git-push/Dockerfile. A
  "Deploy on Railway" one-click template answers "for me or anyone who
  downloads it" — each person gets an isolated instance, no shared
  tenancy.
- **Agent-ops:** Railway's official MCP server (`railway mcp install`)
  wired into the dev workflow, so provisioning, deploys, and logs are
  drivable from a coding-agent session — a deliberate, named goal
  alongside the app itself.

## Explicitly excluded

- **XState v5 persistent actors** — no always-on/interruptible workflow
  need yet. Revisit only if resumable runs become a real requirement.
- The canvas/spatial-viewport/genealogy-node/FAL-specific architecture
  from the source stack note (`AI IMAGE CANVAS RAILWAY.md`) — that belongs
  to an unrelated project and has no equivalent here.

## Open questions carried forward / new

- **Persona assembly mechanics.** Is a compiled persona a concatenated
  header, or literal separate message roles (system vs. instructions vs.
  examples)? Still untested.
- **Golden-set bulk runs.** Does running a persona against a whole saved
  set need a queue or a second Railway service, or is
  sequential-with-progress fine at this scale? Decide once the basic run
  loop exists, not before.
- **Composable persona blocks.** `PIVOT.md`'s idea of a persona as
  named, independently-toggleable blocks (for ablation) may or may not
  still be worth it now that Postgres gives version history for free. A
  single versioned system-prompt string might be enough. Flagged, not
  resolved.

## Sequencing

See `docs/PLAN.md` (rewritten) for the phased build order.

## `/knowledge` folder note

The root-level `knowledge/*.md` files (`prompt-craft.md`, `anti-patterns.md`,
`rubric.md`) belonged to the old complaint-driven-fixer's rubric loop and
have no equivalent in the new architecture — there's no automated
verifier here. Left in place as historical seed content, not deleted, not
actively used.
