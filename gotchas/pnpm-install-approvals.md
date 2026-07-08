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
