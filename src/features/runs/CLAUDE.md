# feature: runs

Orchestration for `docs/PLAN.md` Phase 3's run loop: persona version × saved
input version × model → raw output, persisted. The one feature (besides
`ai` itself) that spends real API credits.

- **Owns**: `createRun` (looks up the persona/input version text, calls
  `#/features/ai`, writes a `runs` row with the result or error);
  `listRuns` (run history for a project, with persona/input names joined
  in for display).
- **Does NOT own**: the Anthropic call itself (`#/features/ai`); Project/
  Persona/Saved Input CRUD (`#/features/projects`).
- **Key decisions**: mirrors the existing `runStatus` pgEnum in
  `src/db/schema.ts` (`pending` → `running` → `success`/`error`) — a run row
  always exists even on failure, with `errorMessage` set instead of
  `output`; no extra auth gate beyond the app's client-side sign-in check,
  same reasoning as `#/features/projects` (this is the in-app caller —
  `src/routes/api/run.ts` is the separate, bearer-gated path for
  external/script use, both call the same `runAnthropicCompletion`).

Read more: `docs/VISION.md` (the core loop), `docs/PLAN.md` (build order).
