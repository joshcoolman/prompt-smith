/**
 * Per-app identity for the scaffold's status landing + document title.
 * This is the ONLY file that differs between the three sibling repos
 * (palette-forge, outpaint-studio, prompt-smith) at scaffold stage —
 * the component, routes, and config are identical.
 */

export type AppStatus = 'scaffolding' | 'planned' | 'building' | 'live'

export type AppMeta = {
  name: string
  tagline: string
  status: AppStatus
  statusNote: string
  repo: string
}

export const appMeta: AppMeta = {
  name: 'prompt-smith',
  tagline:
    'A prompt and a complaint in, an improved prompt out — fixes exactly what you flag.',
  status: 'planned',
  statusNote: 'Planned — begins after palette-forge ships. Scaffold only.',
  repo: 'https://github.com/joshcoolman/prompt-smith',
}
