# prompt-smith

> A focused, BYO-key utility that improves a prompt (or system prompt) against a stated problem. Tuned for good prompt-craft out of the box — its expertise lives in `/knowledge` as plain markdown you can read and rewrite.

High-level sketch. Flesh out after palette-forge.

---

## The one thing it does

Prompt (or system prompt) + a **complaint** in → improved version out. "Too verbose, too many canned phrases, produces bland image results" → it fixes exactly that. Optionally run before/after across one or more models to see the difference.

## What it does NOT do (the boundary)

Improves a prompt against a problem. Not a prompt library, not a chat playground, not a model benchmark suite. The lane is welded; retune _what good prompt-craft means_ via `/knowledge`.

## Why an agent is here (honest)

The verifier comes from two sources, and both are honest:

1. **Your complaint** — a rubric stated in plain language, anchored to a real defect you saw. "Too verbose" is a checkable standard.
2. **The `/knowledge` folder** — the standing expertise about what a good prompt looks like in this domain, applied every run even when you don't complain.

Loop: improve → check against the complaint _and_ the knowledge rubric → revise until satisfied. The human-stated problem is the ground truth; the knowledge is the always-on baseline.

---

## The knowledge layer (the differentiator)

**`/knowledge` is plain, human-readable markdown. Read it and you know what this app thinks a good prompt is. Edit it and the output changes.** Ships tuned for, say, image-generation prompt-craft. A copywriter or a prompt engineer in another domain forks it and rewrites it for theirs — by hand or via their own agent. No code required.

Knowledge influences output in two places: it **guides the rewrite** and it **is part of the rubric the improvement is judged against**.

Starter contents:

```
knowledge/
├── prompt-craft.md    # what makes a good prompt here: concrete nouns, specificity,
│                      # structure, what to keep vs cut
├── anti-patterns.md   # the canned/generic phrases to strip (directly addresses the
│                      # "bland, generic results" complaint) — a living blocklist
└── rubric.md          # how to judge an improved prompt: did it fix the complaint,
                       # is it tighter, did it avoid the anti-patterns
```

`anti-patterns.md` is the most fun one — it's a list you grow every time you spot a phrase that produces mush. The app literally gets better as you add to it, in readable markdown you can diff.

**Deferred:** in-app knowledge-authoring mode. v2.

## Two depths (build the shallow one first)

- **v1 — complaint-driven (ship this):** prompt + complaint in, improved prompt out, judged against the complaint + `/knowledge`. Small, immediately useful, you'd use it this week.
- **Later — optimizer (the capstone):** the system prompt becomes the thing being _optimized_ against a held-out test set; watch the prompt mutate and the score climb. Rung 7. Downstream, only if v1 earns it. Don't build it first.

## Notes for later

- BYO-key, browser-stored.
- Clean addressable records for saved prompts (MCP-readiness).
- Optimizer version: beware judge and optimizer being the same model class agreeing with each other — a held-out set protects against it.

## Stack

TanStack Start + React + TypeScript + Tailwind, Vercel. Same defaults.
