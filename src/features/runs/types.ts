// View-model types for the runs feature.

import type { runs } from '#/db/schema'

export type Run = typeof runs.$inferSelect & {
  personaVersion: {
    version: number
    persona: { name: string }
  }
  savedInputVersion: {
    version: number
    savedInput: { name: string }
  }
}
