# Prompt craft — what makes a good prompt

This is the guidance layer. It tells the improvement agent what to aim for when
rewriting a prompt. Edit this to tune the app for a specific domain or style.

---

## The core principle: concrete and specific beats abstract and general

A good prompt gives the model a specific, visualizable target. Vague intent
produces vague output. Every improvement should ask: *can a reader picture
exactly what this is asking for?*

## Structure

**Lead with the most important constraint.** Models weight early tokens more
heavily. If the output must be in a specific format, voice, or length, say so
first — not at the end where it risks being ignored.

**One task per prompt.** Multi-task prompts produce averaged output. If a prompt
asks the model to summarize AND translate AND reformat, split it or pick the
primary task and subordinate the rest.

**Specify the output format explicitly** when it matters. "Return a JSON object
with fields X, Y, Z" beats "give me the data as JSON" beats "in JSON format."

## Voice and tone

**Name the voice, don't describe it generally.** "Write like a seasoned
technical editor cutting a rough draft" is better than "write professionally."
Concrete roles and comparisons give the model something to pattern-match.

**Avoid hedging language in the prompt itself.** Prompts that say "perhaps" or
"you might want to" produce hedged output. Declarative instructions produce
declarative output.

## Length and density

**Cut the preamble.** Prompts often start with context the model doesn't need
("As you know, large language models can..."). Start with the instruction.

**Match prompt length to task complexity.** Simple tasks need simple prompts.
Over-specified prompts for simple tasks produce over-engineered responses.
Under-specified prompts for complex tasks produce guesses.

## For image generation prompts specifically

**Concrete nouns beat adjectives.** "a copper espresso machine with a steam
wand" beats "a beautiful coffee maker." The model renders what it can picture,
not what sounds nice.

**Name the visual reference if one exists.** "lit like a Vermeer interior" gives
the model a specific lighting model. "warmly lit" does not.

**Specify what's NOT in the frame.** Negative space is often as important as
what's present. "no people, no text, no logos" prevents common intrusions.

**End with the technical spec.** Resolution, ratio, style (photorealistic,
illustration, flat design), and any negative prompts belong at the end.
