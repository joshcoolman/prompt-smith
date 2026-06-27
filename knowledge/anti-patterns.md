# Anti-patterns — phrases that produce mush

A living blocklist. Every phrase here has been observed to produce generic,
bland, or unhelpful model output. When the improvement agent rewrites a prompt,
it strips these. When you spot a new one, add it here — the app literally gets
better as this list grows.

The pattern to catch: **modifier phrases that signal good intent without
specifying a concrete target.** They tell the model "be good" without saying
what good looks like in this context.

---

## Generic quality signals

These read as praise-language rather than instruction. Models produce output
that sounds like it deserves the praise, rather than output that is actually
better.

- "high quality"
- "high-quality"
- "best possible"
- "excellent"
- "outstanding"
- "top-notch"
- "world-class"
- "exceptional"

**Replace with:** a specific measurable criterion. "under 100 words" beats
"concise." "formatted as a numbered list with one sentence per item" beats
"well-organized."

## Vague tone/style descriptors

These are aspirational rather than actionable.

- "professional"
- "professional tone"
- "in a professional manner"
- "polished"
- "sophisticated"
- "elegant"
- "engaging"
- "compelling"
- "captivating"
- "interesting"
- "thoughtful"
- "insightful"

**Replace with:** a role, a reference, or a concrete description. "written for
a senior engineer reviewing a PR" beats "professional." "conversational, like
a Slack message to a colleague" beats "engaging."

## Comprehensiveness theater

These signal that the model should try hard, not that it should do something
specific.

- "comprehensive"
- "thorough"
- "in-depth"
- "detailed"
- "exhaustive"
- "complete"
- "fully"
- "entirely"

**Replace with:** the actual scope. "cover all three error cases mentioned
above" beats "thoroughly." "include one example per concept" beats "detailed."

## Hedging and apologetics

These make the prompt sound uncertain, which produces uncertain output.

- "please"
- "if possible"
- "you might want to"
- "perhaps"
- "feel free to"
- "as you see fit"
- "at your discretion"
- "whenever appropriate"

**Replace with:** declarative instruction. "Return only the revised version,
no explanation" beats "feel free to just return the revised version if you
think that's appropriate."

## Image generation specific

Phrases that produce the visual equivalent of stock photography.

- "beautiful"
- "stunning"
- "gorgeous"
- "breathtaking"
- "majestic"
- "vibrant colors"
- "rich colors"
- "warm and inviting"
- "cinematic" (without specifying which film or cinematographer)
- "photorealistic" (without other grounding — use camera specs instead)
- "dreamlike"
- "magical"
- "whimsical"

**Replace with:** concrete visual specifics. Camera model, lens, lighting
source, color temperature in Kelvin, named reference work or photographer.
