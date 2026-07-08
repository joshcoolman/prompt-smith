# prompt-smith — pivot (2026-07-03)

> **Superseded (2026-07-07)** — see [`docs/VISION.md`](VISION.md) for the
> current direction. This doc's delivery model and sequencing no longer
> apply; kept as history, not deleted.

> Supersedes the "complaint-driven prompt fixer" framing in `SPEC.md` and the
> prompt-smith section of `OVERVIEW.md`. Those are left in place as history,
> not deleted — this doc is the current direction. Reconcile them before
> resuming work here.

## What changed and why

The old spec: a public, BYO-key product — prompt + complaint in, improved
prompt out, judged against `/knowledge` + the stated complaint.

The trigger for the rethink: palette-forge's own dev toolbar (persona
picker, save/run/compare prompts) was more useful in practice than the
planned prompt-smith product — but its eval output fed straight back into
the live app. That coupling was premature; testing a prompt shouldn't be
able to move what a real user sees.

The reframe: prompt-smith isn't a public product to ship. It's the tool
*behind* apps like palette-forge — a domain-agnostic prompt/persona
workbench you drop into any project, build expertise inside, and either
copy text out of directly (e.g. a finished Midjourney prompt) or hand off
as a matured artifact to whatever app actually needs it. The public/BYO-key
"designer who builds agents" framing from `OVERVIEW.md` is parked, not
decided — see Open questions.

## The core mechanism: composable, toggleable persona blocks

A persona is not one markdown blob. It's a manifest pointing at named,
independently-toggleable blocks:

```
personas/<name>/
├── persona.yaml              # manifest — order + on/off per block
└── blocks/
    ├── persona-description.md
    ├── primary-task.md
    ├── success-criteria.md
    ├── resources/*.md        # domain knowledge, incl. model-specific
    │                         # phrasing notes (e.g. Nano Banana vs Seedance)
    ├── examples/*.md          # a POOL — individually selectable, not
    │                          # all-or-nothing (mirrors DSPy demonstration
    │                          # selection)
    └── tools.md
```

Why: a single blob makes it impossible to know which sentence caused which
change — still incantation, no matter how tidy the surrounding folders are.
Toggling named blocks on/off and re-running against a golden prompt set
turns "why did this get better" from a guess into an observation
(ablation, judged by eye — no automatic metric assumed, since most target
domains here don't have one).

This is the same shape as DSPy — named, separately-addressable fields
instead of a fused prompt string — done by hand with human judgment
standing in for DSPy's optimizer/metric, because domains like product
photography or palette taste don't have a clean score to optimize against.

## Delivery model: nested, never coupled

prompt-smith is its own repo (own `.git`, own `package.json`, own dev
server). To use it inside a host project:

```
host-app/                     ← host's own repo
├── .git/
├── .gitignore                # contains: /prompt-smith  ← load-bearing
├── src/...
└── prompt-smith/             ← cloned in, fully separate .git
    ├── personas/...
    └── ...
```

- Two independent dev servers, two ports (e.g. host on :3000, prompt-smith
  on :3001) — not one server proxying a `/prompt-smith` sub-path. No proxy
  config, no shared state, no awareness in either direction.
- `.gitignore`-ing the folder (not a git submodule) keeps the host repo
  from ever recording a commit-pin on prompt-smith — zero version coupling.
- During local dev, a host feature *can* read a persona's blocks directly
  from the sibling folder (cheap glob import) — but that only works on your
  machine. Nothing under `prompt-smith/` exists in a deployed build, since
  it was never part of the host's git history.
- **Freeze/export**, not live sync: when a persona is actually ready, copy
  its current blocks once into the host's own tracked `knowledge/` folder.
  A deliberate snapshot, not an ongoing dependency.

## Sequencing

1. Build prompt-smith standalone: persona-creation UI first (start from
   "you are a helpful assistant," add blocks), golden-prompt runner,
   side-by-side output comparison. Usable on its own before anything nests
   it — the copy-a-finished-prompt-into-Midjourney case alone justifies the
   repo, no host app required.
2. **First real validation**: decompose palette-forge's two existing
   (already hand-tuned, blob-style) personas into blocks inside a nested
   prompt-smith. Run both against a golden set. Test whether the result is
   good enough to propose replacing palette-forge's original dev toolbar —
   **without changing anything in palette-forge itself.** Real baseline to
   beat, not a synthetic test.
3. Only after that: scaffold a fresh reference app (name irrelevant,
   disposable) if a genuinely new domain shows up worth exploring (product
   photography was the running example — six shot types, per-model
   phrasing for e.g. FAL's Nano Banana / Seedance 2.0).

## Precedent already in the repos — look here before designing from scratch

- **`~/repos/bootstrap`** — the `add-*` skill contract (see its `add-auth`
  skill) is the template for "drop something in without coupling it": a
  typed interface as the seam (not a folder convention), one file that
  knows the specifics, edit-don't-clobber on existing files, every step
  ending in a build-green gate, interactive/vendor steps hard-walled into
  a separate script. Its `parts/knowledge.md` is also already the *read*
  half of this exact idea — a `knowledge/*.md` folder plus a ~15-line glob
  loader — one-sided (no authoring UI yet), which is the gap this project
  fills.
- **`~/repos/repo-explorer`** — already has named, swappable personas in
  production (`.claude/skills/explore-repo/personas.json` + a
  `create-persona` meta-skill that scaffolds a new persona from an
  existing one). Worth reusing that scaffolding approach for how a new
  persona gets created here, rather than inventing a second convention.

## Open questions (not blockers, don't resolve prematurely)

- **Personal tool vs. public product.** Everything above is scoped as a
  personal dev tool. `OVERVIEW.md`'s original "public/portfolio" framing
  for prompt-smith hasn't been ruled out, just isn't the current target.
- **Assembly mechanics.** Is a compiled persona concatenated headers, or
  literal separate message roles (system vs. instructions vs. examples)?
  Untested — order/adjacency likely affects output in ways only visible
  once you actually toggle blocks.
- **Knowledge file metadata.** Loosely worth adopting from OKF (Open
  Knowledge Format, GoogleCloudPlatform/knowledge-catalog, v0.1 draft):
  YAML frontmatter with a `type` field per knowledge/block file — cheap,
  backward-compatible, useful for a future authoring UI to list/filter
  without reading full bodies. Explicitly **not** adopting OKF's
  concept-ID cross-linking, citations, or index/log formalism — that
  solves a large multi-concept catalog problem this doesn't have.
