# feature: ai

The Effect AI provider layer (`docs/PLAN.md` Phase 2). Persona + input +
model choice → raw output. Provider-agnostic contract in, one vendor call
inside.

- **Owns**: the `RunInput`/`RunOutput` contract (`types.ts`); the Anthropic
  adapter (`anthropic-provider.ts` — server-only, the only file that knows
  `@effect/ai-anthropic`).
- **Does NOT own**: HTTP request parsing or auth checks (`src/routes/api/run.ts`
  does that); persistence of runs (Phase 3, once Projects/Personas/Inputs
  exist).
- **Key decisions**: consumers import only `index.ts`; a second provider
  (OpenAI, etc.) is a second `*-provider.ts` file plus a discriminator on
  `RunInput.model`, nothing else changes; the API key is read server-side via
  `Config.redacted('ANTHROPIC_API_KEY')` — never sent to or stored in the
  browser; `FetchHttpClient` (not `@effect/platform-node`) supplies the HTTP
  client since Node's global `fetch` is enough and avoids pulling in
  `@effect/platform-node`'s `@effect/sql`/`@effect/cluster` peer tree.
- **Multimodal**: `RunInput.attachments` (image/PDF as raw base64, no `data:`
  URL prefix — the adapter passes strings straight through to Anthropic)
  become `Prompt.FilePart`s alongside the text prompt — see `toPrompt` in
  `anthropic-provider.ts`. Proved end-to-end against a real PNG, not just
  text.

Read more: `docs/VISION.md` (the what/why), `docs/PLAN.md` (build order).
