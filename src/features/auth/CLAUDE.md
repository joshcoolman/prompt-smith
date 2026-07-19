# Feature: auth

## What this owns

The whole sign-in boundary: password verification, the session cookie, and the
`getCurrentUserId()` backstop. No auth service, no database, no signup route.

## What it does NOT own

Route gating lives in `src/proxy.ts` (Edge middleware). Anything about *who a
user is* beyond an opaque id — profiles, roles, preferences — belongs to
another feature.

## Key design decisions

- **Allowlist, not accounts.** `AUTH_USERS` is a comma-separated list of
  `email:salt:hash`. Access is granted out-of-band with `pnpm auth:add-user`
  and a redeploy. There is no signup, no reset, no OAuth, no roles. If this app
  ever needs real user accounts, that is the signal to adopt `better-auth` —
  not to extend this.
- **Edge/Node split is structural.** `session.ts` is Web Crypto only and is what
  `proxy.ts` imports directly. `credentials.ts` uses `node:crypto`. The barrel
  (`index.ts`) re-exports both and must never be imported by middleware.
- **Dot-free user ids.** The cookie is `userId.issuedAtMs.signature`, split on
  `.`, so the id is a sha256 prefix of the email, never the email itself.
- **Stateless sessions.** No sessions table, so no server-side revocation. Sign
  out clears the cookie on that browser; a stolen cookie stays valid until it
  expires or `AUTH_SESSION_SECRET` changes.
- **`getCurrentUserId()` throws** rather than returning null, so data access can
  never silently proceed unauthenticated when a caller forgets to check.

## Where to read more

`docs/SPEC.md` (the auth boundary), `docs/PLAN.md` (build order).
