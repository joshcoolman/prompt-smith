// Public surface of the projects feature. Consumers import from here only —
// never from server.ts directly.

export type {
  Project,
  Persona,
  PersonaVersion,
  SavedInput,
  SavedInputVersion,
  ProjectDetail,
} from './types'

export {
  listProjects,
  createProject,
  deleteProject,
  getProjectDetail,
  createPersona,
  createPersonaVersion,
  createSavedInput,
  createSavedInputVersion,
} from './server'
