# feature: verify

The judgment call. Takes the original prompt, the complaint, the improved
prompt, and the rubric, and returns a schema-validated `PromptVerdict`.

- **Two sources of truth.** The complaint (what the user said was wrong) and
  `rubric.md` (the always-on baseline). Both are checked every run.
- **Emits `PromptVerdict`** (see `src/features/improve/types.ts`). Typed,
  validated — never untyped JSON. If verification fails the schema, it's a
  verify error, not a pass.
- **Drives the loop.** If `pass: false`, the issue list is passed back to
  `generate` as revision constraints. Hard cap: 3 iterations total.

Build order: `docs/PLAN.md`.
