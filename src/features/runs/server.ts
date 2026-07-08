// Server-only. Ties a persona version + saved input version + model
// together, calls #/features/ai, persists the result. Gated only by the
// app's existing client-side sign-in check, same as #/features/projects.

import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db/client'
import { personaVersions, runs, savedInputVersions } from '#/db/schema'
import { runAnthropicCompletion } from '#/features/ai'

export const createRun = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      projectId: string
      personaVersionId: string
      savedInputVersionId: string
      model: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const [personaVersion, savedInputVersion] = await Promise.all([
      db.query.personaVersions.findFirst({
        where: eq(personaVersions.id, data.personaVersionId),
      }),
      db.query.savedInputVersions.findFirst({
        where: eq(savedInputVersions.id, data.savedInputVersionId),
      }),
    ])
    if (!personaVersion || !savedInputVersion) {
      throw new Error('Persona version or saved input version not found')
    }

    const [run] = await db
      .insert(runs)
      .values({
        projectId: data.projectId,
        personaVersionId: data.personaVersionId,
        savedInputVersionId: data.savedInputVersionId,
        model: data.model,
        status: 'running',
      })
      .returning()

    try {
      const output = await runAnthropicCompletion({
        model: data.model,
        systemPrompt: personaVersion.systemPrompt,
        prompt: savedInputVersion.promptText,
      })
      const [updated] = await db
        .update(runs)
        .set({ status: 'success', output: output.text, completedAt: new Date() })
        .where(eq(runs.id, run.id))
        .returning()
      return updated
    } catch (error) {
      const [updated] = await db
        .update(runs)
        .set({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        })
        .where(eq(runs.id, run.id))
        .returning()
      return updated
    }
  })

export const listRuns = createServerFn({ method: 'GET' })
  .validator((data: { projectId: string }) => data)
  .handler(async ({ data }) => {
    return db.query.runs.findMany({
      where: eq(runs.projectId, data.projectId),
      orderBy: desc(runs.createdAt),
      with: {
        personaVersion: { with: { persona: true } },
        savedInputVersion: { with: { savedInput: true } },
      },
    })
  })
