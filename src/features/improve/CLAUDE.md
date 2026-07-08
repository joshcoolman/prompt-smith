> Superseded — see docs/VISION.md. This feature seam belonged to the old complaint-driven-fixer mechanism and is retired under the new architecture. Kept as reference, not deleted.

# feature: improve

The domain core. Owns the `PromptRecord` type and the orchestration seam that
sequences generate → verify → revise into a finished improvement.

- **Thin orchestrator.** Takes a prompt + complaint, calls `generate`, calls
  `verify`, loops on failure up to the iteration cap (3). Holds no provider
  logic or rubric logic — those live in `generate` and `verify`.
- **Records, not ephemeral state.** Each improvement run produces a
  `PromptRecord` with a stable ID. Persist to IndexedDB (the `prefs` pattern).
  MCP-ready from day one.
- **The complaint is the primary ground truth.** The verify loop is grounded in
  what the user actually said was wrong — not a generic quality score.

Build order and full contract: `docs/PLAN.md`.
