// Server-only. Pure Drizzle CRUD over projects/personas/savedInputs — no
// vendor calls (that's #/features/runs). Gated only by the app's existing
// client-side sign-in check, same trust model as the rest of the app.

import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db/client'
import {
  personas,
  personaVersions,
  projects,
  savedInputs,
  savedInputVersions,
} from '#/db/schema'

import type { ProjectDetail } from './types'

export const listProjects = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.select().from(projects).orderBy(desc(projects.createdAt))
  },
)

export const createProject = createServerFn({ method: 'POST' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const [project] = await db
      .insert(projects)
      .values({ name: data.name })
      .returning()
    return project
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete(projects).where(eq(projects.id, data.id))
  })

export const getProjectDetail = createServerFn({ method: 'GET' })
  .validator((data: { projectId: string }) => data)
  .handler(async ({ data }): Promise<ProjectDetail> => {
    const [project, personaRows, savedInputRows] = await Promise.all([
      db.query.projects.findFirst({
        where: eq(projects.id, data.projectId),
      }),
      db.query.personas.findMany({
        where: eq(personas.projectId, data.projectId),
        with: { versions: { orderBy: desc(personaVersions.version) } },
      }),
      db.query.savedInputs.findMany({
        where: eq(savedInputs.projectId, data.projectId),
        with: { versions: { orderBy: desc(savedInputVersions.version) } },
      }),
    ])

    if (!project) throw new Error('Project not found')

    return { project, personas: personaRows, savedInputs: savedInputRows }
  })

export const createPersona = createServerFn({ method: 'POST' })
  .validator(
    (data: { projectId: string; name: string; systemPrompt: string }) => data,
  )
  .handler(async ({ data }) => {
    const [persona] = await db
      .insert(personas)
      .values({ projectId: data.projectId, name: data.name })
      .returning()
    await db.insert(personaVersions).values({
      personaId: persona.id,
      version: 1,
      systemPrompt: data.systemPrompt,
    })
    return persona
  })

export const createPersonaVersion = createServerFn({ method: 'POST' })
  .validator((data: { personaId: string; systemPrompt: string }) => data)
  .handler(async ({ data }) => {
    const [latest] = await db
      .select({ version: personaVersions.version })
      .from(personaVersions)
      .where(eq(personaVersions.personaId, data.personaId))
      .orderBy(desc(personaVersions.version))
      .limit(1)

    const [version] = await db
      .insert(personaVersions)
      .values({
        personaId: data.personaId,
        version: (latest?.version ?? 0) + 1,
        systemPrompt: data.systemPrompt,
      })
      .returning()
    return version
  })

export const createSavedInput = createServerFn({ method: 'POST' })
  .validator(
    (data: { projectId: string; name: string; promptText: string }) => data,
  )
  .handler(async ({ data }) => {
    const [savedInput] = await db
      .insert(savedInputs)
      .values({ projectId: data.projectId, name: data.name })
      .returning()
    await db.insert(savedInputVersions).values({
      savedInputId: savedInput.id,
      version: 1,
      promptText: data.promptText,
    })
    return savedInput
  })

export const createSavedInputVersion = createServerFn({ method: 'POST' })
  .validator((data: { savedInputId: string; promptText: string }) => data)
  .handler(async ({ data }) => {
    const [latest] = await db
      .select({ version: savedInputVersions.version })
      .from(savedInputVersions)
      .where(eq(savedInputVersions.savedInputId, data.savedInputId))
      .orderBy(desc(savedInputVersions.version))
      .limit(1)

    const [version] = await db
      .insert(savedInputVersions)
      .values({
        savedInputId: data.savedInputId,
        version: (latest?.version ?? 0) + 1,
        promptText: data.promptText,
      })
      .returning()
    return version
  })
