# Spec

## The welded boundary

A persona's quality can only be fully judged in the context that actually
consumes it — a rendered palette, a moderated image, a generated product photo.
A standalone tool cannot replicate that context, and trying to would turn it
into a bad, permanently-lagging clone of every host app it might ever serve.

The honest, containable slice a standalone tool **can** own is raw text and
multimodal output, compared side by side. Anything past that belongs in the
host app. This boundary is welded shut on purpose; re-opening it is how this
project previously talked itself into a design it had to abandon.

## The data model — four nouns

- **Project** — top-level container. Starts empty; everything belongs to
  exactly one project.
- **Persona** — a system prompt. Versioned: every edit inserts a new version,
  never overwrites.
- **Saved Input** — a user prompt plus optional attachments. Versioned
  identically.
- **Run** — one persona version × one saved input version × one model,
  producing raw output.

Versions are rows, not mutations. Runs pin `personaVersionId` and
`savedInputVersionId` with `onDelete: restrict`, so a run can never end up
pointing at a prompt that no longer says what it said when the run happened.

## Key design decisions

**No Effect.** Model calls go through a thin `callModel(persona, input, model)`
adapter this repo owns. The previous implementation used `@effect/ai`; it was
adopted on reputation, not because a problem here demanded it. This app makes
one API call and displays the result. Per-provider multimodal shaping — the one
genuinely fiddly part — is a `switch` in one file, not a reason to adopt a
runtime.

**API keys are server-side only.** Provider calls happen in server actions or
route handlers. No key ever reaches the browser.

**Comparison is by eye.** Side-by-side output is the product. No scoring layer
sits between the operator and the raw text.

## The auth boundary

Auth is **allowlist-shaped**, self-hosted, and has no database:

- **No signup route.** Access is granted out-of-band by an operator adding an
  entry to `AUTH_USERS` and redeploying. `pnpm auth:add-user` prints the entry.
- **No password reset, no OAuth, no roles.** Everyone on the allowlist has
  identical access. The app does not distinguish between them beyond an opaque
  id derived from the email.
- **No server-side revocation.** The session is a signed, stateless cookie —
  there is no sessions table to delete a row from. Signing out clears the cookie
  in that browser; a stolen cookie stays valid until it expires (30 days) or
  until `AUTH_SESSION_SECRET` is changed, which invalidates every session at
  once.
- **Deny by default.** Every route requires a session except `/login`. That
  includes `/docs`.

If this app ever needs real user accounts, that is the signal to adopt
`better-auth` — not to extend this.
