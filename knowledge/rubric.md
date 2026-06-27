# Rubric — how to judge an improved prompt

This is the verifier's rubric. The verify agent reads this and judges whether
the improved prompt is actually better than the original. A result passes when
there are no high-severity issues.

Each judgment maps to one `PromptIssueKind` in the `PromptVerdict` schema. Cite
the kind and include a one-line note specific enough to drive a revision.

---

## What to check

### `complaint_unaddressed` (high severity)

The stated complaint is the primary ground truth. If the user said "too verbose"
and the improved prompt is the same length, the improvement failed — regardless
of what else changed. Always check the complaint first.

A result **fails** on this criterion if the complaint is not materially
addressed. "Materially" means a reasonable person reading both versions would
agree the problem is fixed.

### `anti_pattern_survived` (high severity)

Check the improved prompt against `anti-patterns.md`. If any listed phrase
survived the rewrite, the improvement is incomplete. This is a mechanical check
— presence of the phrase is sufficient to flag it.

### `specificity_regressed` (medium severity)

The improved version is more vague than the original. This happens when the
agent "cleans up" a prompt by removing detail rather than restructuring it.
Shorter is not always better — shorter with the same specificity is better.
Shorter with less specificity is worse.

Signs: concrete nouns replaced with categories, named references removed,
specific constraints softened to general ones.

### `structure_lost` (medium severity)

The original prompt had a clear structure (numbered steps, a role definition,
an output format spec) and the improved version lost it. Structure is usually
load-bearing — don't remove it unless the complaint explicitly asked for that.

### `meaning_changed` (high severity)

The improved prompt does something materially different from what the original
intended. This is the most serious failure — an improvement that changes the
task is not an improvement.

Signs: a different output format was substituted, a different audience was
assumed, a constraint was inverted or removed rather than improved.

### `instructions_added` (low severity)

The improved prompt added instructions the user didn't ask for. Low severity
because sometimes these are genuinely helpful, but flag it so the user can
review. The user's intent is the boundary — additions beyond it need
justification.

---

## How to report

For each issue: the `kind`, a `severity` (`low` / `medium` / `high`), and a
one-line `note` specific enough to drive a targeted revision ("'comprehensive'
survived in the third sentence" not "anti-patterns remain").

If the improved prompt passes all criteria, return `pass: true` with an empty
issue list. Don't invent problems — a tighter, more specific prompt that
addresses the complaint is the goal.
