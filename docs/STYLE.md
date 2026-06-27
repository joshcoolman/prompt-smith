# Style system — Paper & Ink

The global look ("Paper & Ink": warm paper, soft ink, one clay accent, light +
dark) is a self-contained, portable baseline. This doc is the contract and the
port recipe. If someone says _"I like this repo's styles, grab them"_ — this is
the page to read.

## Where it lives

```
src/styles/
  index.css       entry — pulls in Tailwind + the partials + the @theme bridge
  tokens.css      the design contract: colors, fonts, scales (light + dark)
  base.css        html/body element styling
  typography.css  house-* roles + the .prose reading layer
```

`tokens.css` is the prize. It is plain CSS custom properties — no Tailwind
syntax — so it reads and edits cleanly. Everything else derives from it.

## The whole thing is five touch-points

To lift this identity into another project, copy these and nothing else:

1. **`src/styles/`** — the four files above (the styles themselves).
2. **The font `<link>`s** — IBM Plex Sans, Martel, Space Mono. In
   `src/routes/__root.tsx` (the `fonts.googleapis.com/css2?...` stylesheet link
   plus the two `preconnect`s).
3. **The pre-paint theme script** — the small inline `<script>` in `__root.tsx`
   that sets `data-theme` before first paint (saved preference, else the OS
   `prefers-color-scheme`). Prevents a flash of the wrong theme.
4. **`data-theme` on the root element** — `<html data-theme="light">`. Any
   element can carry it to scope a theme to a subtree.
5. **Tailwind v4** — `tailwindcss` + `@tailwindcss/vite` (or the PostCSS
   plugin). The `@theme inline` bridge in `index.css` needs v4.

That's it. No build config beyond Tailwind v4, no component library, no plugin.

## Theme toggle (optional)

The theme is the `data-theme` attribute on `<html>`. The pre-paint script picks
the initial value (saved preference, else OS), and that is enough on its own —
the app is fully themed without any UI. If you want a manual switch:

- **`src/components/theme-toggle.tsx`** — a small global sun/moon button
  (rendered once in `__root.tsx`). It flips `data-theme` and saves the choice to
  `localStorage['site-theme']`, the same key the pre-paint script reads.
- It needs the **`@custom-variant dark ([data-theme='dark'] &)`** line in
  `index.css` (already there) — that binds Tailwind's `dark:` variant to our
  `data-theme`, so the icon swaps with no hydration flash. The tokens already
  auto-switch on `[data-theme]`, so `dark:` is only needed for the rare case of
  rendering different markup per theme (like this icon).

The toggle is additive: it imports nothing from `tokens.css` and changes no
values, so it does not affect the baseline look.

## How it works (the one idea)

`tokens.css` defines values as CSS variables. `index.css`'s `@theme inline`
block re-exposes them as Tailwind utilities (`bg-surface`, `text-muted`,
`font-serif`, …). Because the bridge is `inline` (var() references, not frozen
values), those utilities follow the runtime `data-theme` switch automatically.

So there is one source of truth. **To reskin, edit `tokens.css`** — both raw CSS
and every Tailwind utility update together, in light and dark.

## The one rule: keep the baseline clean

**Feature styles never live in `src/styles/`.** That folder is the frozen
baseline; treat it as read-only during feature work. Feature styling goes:

- **Default:** token-based Tailwind utilities right in the component
  (`className="bg-surface text-text-muted rounded-md"`). This is almost always
  enough and stays automatically themed.
- **If a feature genuinely needs custom CSS:** co-locate it with the feature
  (`src/features/<x>/<x>.module.css`), not here.
- **Reach for a new global only** when something is truly cross-cutting and
  belongs to the design system — and then it is a deliberate token/role change,
  reviewed as such, not a side effect of building a feature.

Following this, the baseline stays a clean, grabbable unit no matter how much
feature work lands on top of it.
