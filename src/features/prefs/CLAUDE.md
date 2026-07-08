> Superseded — see docs/VISION.md. This feature seam belonged to the old complaint-driven-fixer mechanism and is retired under the new architecture. Kept as reference, not deleted.

# feature: prefs

Local, single-user preferences. BYO API key storage, no backend.

- **IndexedDB only.** No accounts, no server, no credits. Keys live in the
  browser.
- **Mirrored to a sync in-memory object** so render decisions ("show the key
  input panel?") are synchronous — no async in the component tree for prefs.
- **What it stores:** the user's Anthropic API key and free-tier usage count
  (how many no-key improvements remain before the BYO-key panel is shown).
- **The funnel:** no key → free tier (a small allowance via a proxy or just
  prompt the user immediately — decide during Phase 1). Cap reached → reveal
  the BYO-key input.

Build order: `docs/PLAN.md`.
