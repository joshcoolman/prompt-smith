# feature: auth

Single-user email/password login gating the whole app. Not multi-user auth —
any account that exists in the linked Supabase project gets identical
access, because the app never checks *which* user is signed in.

- **Owns**: the `AuthClient` contract (`types.ts`); the Supabase adapter
  (`supabase-adapter.ts` — lazy, env-tolerant, the only file that knows
  Supabase); the React surface (`AuthProvider` + `useAuth`); the mock
  adapter (`mock-adapter.ts`, test double, not exported from `index.ts`).
- **Does NOT own**: route guarding (`src/routes/index.tsx`'s `beforeLoad`
  calls `getAuthClient().getSession()` itself); user provisioning
  (`scripts/setup.mjs`, run via `pnpm setup:supabase`); styling.
- **Key decisions**: consumers import only `index.ts`; the vendor appears in
  exactly one file — a second vendor is a second adapter, nothing else
  changes; errors cross the contract as plain strings, not vendor error
  objects; the once-per-load stale-session verification (`getSession()`
  re-checks with the server once, then trusts localStorage); never `await`
  another auth call inside `onAuthStateChange` — supabase-js holds a lock
  while dispatching and deadlocks.
- **No signup UI, no password reset, no OAuth, no roles.** The one account
  is provisioned server-side by the setup wizard's admin-API call.

Read more: `docs/PLAN.md` (build order), `gotchas/` (deploy-time lessons).
