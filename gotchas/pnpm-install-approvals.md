# pnpm build-script approvals (`ERR_PNPM_IGNORED_BUILDS`)

Full playbook: `bootstrap/gotchas/pnpm-install-approvals.md` (canonical —
update it there if this ever needs a correction, not here).

## What happened here

`pnpm-workspace.yaml` listed `esbuild`/`lightningcss` under
`onlyBuiltDependencies` — a setting pnpm v11 removed in favor of
`allowBuilds`. This repo pins `pnpm@11.7.0`, so the block was silently
dead. Three consecutive Railway builds failed with
`ERR_PNPM_IGNORED_BUILDS` (confirmed from the build log for deployment
`e90054eb`). Invisible locally because this machine's pnpm store already
had those exact builds approved from other projects.

Fix: `allowBuilds: { esbuild: true, lightningcss: true }`. See PR #5
(`fix/railway-pnpm-allowbuilds`, merged as `fb1a8d0`).

## Recurrence: `msgpackr-extract` (Phase 2)

Same failure mode, new package: `@effect/platform` (added for the Phase 2
Effect AI provider layer, `docs/PLAN.md`) transitively pulls in
`msgpackr` → `msgpackr-extract`'s native build script. Not caught at merge
time because auto-deploy was off (see `feedback_deploy_ownership` memory)
and local installs stayed green — same "invisible locally, store already
approved it" trap as the first hit. Only surfaced when manually triggering
a Railway deploy well after the Phase 2/3 merges.

Fix: add `msgpackr-extract: true` to `allowBuilds`. **Lesson for next
time**: after adding any new dependency (especially transitive, especially
from a package with native bindings — Effect's AI packages, image/PDF
libs, etc.), run `pnpm why <new-thing>` isn't enough; the real proof is
`rm -rf node_modules && pnpm install --frozen-lockfile` in a shell with no
prior global pnpm-store approvals for that package (or just watch the next
real deploy closely).
