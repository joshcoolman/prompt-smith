# feature: projects

Pure Drizzle CRUD over the Phase 1 schema (`docs/PLAN.md` Phase 3). Owns
Project, Persona (+ versions), Saved Input (+ versions) — the "library" of a
project. No vendor calls; that's `#/features/runs` and `#/features/ai`.

- **Owns**: the view-model types (`types.ts`, inferred from
  `src/db/schema.ts`); the `createServerFn` CRUD (`server.ts`).
- **Does NOT own**: running a persona against an input (`#/features/runs`);
  the Anthropic call itself (`#/features/ai`); attachments — the schema has
  the table, but upload UI/storage is deliberately out of scope until a
  fast-follow (text-only Saved Inputs for now).
- **Key decisions**: consumers import only `index.ts`; edits never overwrite
  — `createPersonaVersion`/`createSavedInputVersion` always insert
  `max(version) + 1`, matching `docs/VISION.md`'s "every edit is a new
  version"; no extra auth gate on these server functions beyond the app's
  existing client-side sign-in check (`src/routes/index.tsx`'s
  `beforeLoad`) — CRUD isn't cost-incurring like the `ai`/`runs` calls, so
  the bearer-token treatment `/api/run` gets doesn't apply here.

Read more: `docs/VISION.md` (the four nouns), `docs/PLAN.md` (build order).
