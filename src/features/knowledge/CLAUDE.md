> Superseded — see docs/VISION.md. This feature seam belonged to the old complaint-driven-fixer mechanism and is retired under the new architecture. Kept as reference, not deleted.

# feature: knowledge

Loads `/knowledge/*.md` and exposes it to the rest of the app. The whole
feature is ~15 lines.

```ts
const files = import.meta.glob('/knowledge/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export function getKnowledge(name: string): string {
  const key = `/knowledge/${name}.md`
  return (files[key] as string) ?? ''
}
```

Call `getKnowledge('prompt-craft')`, `getKnowledge('anti-patterns')`,
`getKnowledge('rubric')` to get the contents of the corresponding markdown
file. Pass directly into prompts.

Knowledge files are plain markdown — a non-coder can read and rewrite them to
tune the app's behavior without touching code. That's the point.
