# Style

The visual system is **Paper & Ink**: warm paper, soft near-black ink, one
muted clay accent, in light and dark modes.

## The contract

`src/styles/tokens.css` is the single source of truth. Everything else reads
from it via `var(--token-name)`. **To reskin the whole app, edit `tokens.css`
and nothing else.**

```
src/styles/
  index.css       entry — Tailwind import + partials + the @theme bridge
  tokens.css      the design contract: colors, fonts, scales (light + dark)
  base.css        html/body styling
  typography.css  house-* roles + the .prose reading layer + .compact variant
```

## The four touch-points

The style system is a portable unit — copy `src/styles/` plus these four wires
and the whole visual identity moves to another app:

1. **`src/styles/`** — all four files.
2. **`import '#/styles/index.css'`** in `src/app/layout.tsx`. This is what makes
   Tailwind process utilities.
3. **Fonts via `next/font/google`** in `layout.tsx` — self-hosted, exposed as the
   CSS variables `tokens.css` reads. No CDN links.
4. **`data-theme="dark"` + `suppressHydrationWarning` on `<html>`, plus
   `<ThemeInit />`** — the theme wiring.

## Type roles

- `.house-title`, `.house-dek`, `.house-section`, `.house-eyebrow` — page-chrome
  type. Apply by class name anywhere.
- `.prose` — the long-form reading layer (Martel serif body, IBM Plex Sans
  heads, em-dash list markers). Each surface sets its own `max-width`.
- `.prose.compact` — same type system at reference-doc density. Used by `/docs`.

## The one rule

**Feature styles never go in `src/styles/`.** That folder is the frozen
baseline — treat it as read-only during feature work.

- Default: token-based Tailwind utilities in the component
  (`className="bg-surface text-text-muted rounded-md"`).
- If a feature genuinely needs custom CSS: co-locate it as
  `src/features/<x>/<x>.module.css`.

## Known trade-off

The server always renders `data-theme="dark"` first, so a visitor whose stored
preference is light can see one frame of dark before `ThemeInit` corrects it
after hydration. This is a documented accepted trade-off, not an oversight. The
fix, if it ever matters, is a blocking inline script in `layout.tsx`.

## No emoji

Not in the UI, not in the codebase, not in these docs.
