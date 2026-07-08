// View-model types for the projects feature. Inferred straight from the
// Drizzle schema — this feature has no shape of its own beyond the tables.

import type {
  personas,
  personaVersions,
  projects,
  savedInputs,
  savedInputVersions,
} from '#/db/schema'

export type Project = typeof projects.$inferSelect

export type PersonaVersion = typeof personaVersions.$inferSelect
export type Persona = typeof personas.$inferSelect & {
  versions: PersonaVersion[]
}

export type SavedInputVersion = typeof savedInputVersions.$inferSelect
export type SavedInput = typeof savedInputs.$inferSelect & {
  versions: SavedInputVersion[]
}

export interface ProjectDetail {
  project: Project
  personas: Persona[]
  savedInputs: SavedInput[]
}
