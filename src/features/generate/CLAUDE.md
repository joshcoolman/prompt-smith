# feature: generate

The generation call. Assembles the system prompt from knowledge files and sends
the user's prompt + complaint to the LLM.

- **Prompt assembly.** Reads `prompt-craft.md` and `anti-patterns.md` via the
  `knowledge` feature. These become the system prompt context that guides the
  rewrite.
- **No provider logic in the orchestrator.** `improve` calls this feature;
  this feature owns the SDK call and the prompt construction.
- **Provider:** Anthropic (`@anthropic-ai/sdk`). BYO-key from `prefs`.
- **Returns a string** — the improved prompt text. Schema validation happens in
  `verify`, not here.

Build order: `docs/PLAN.md`.
