import { relations } from 'drizzle-orm'
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const runStatus = pgEnum('run_status', [
  'pending',
  'running',
  'success',
  'error',
])

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const personaVersions = pgTable('persona_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  personaId: uuid('persona_id')
    .notNull()
    .references(() => personas.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const savedInputs = pgTable('saved_inputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const savedInputVersions = pgTable('saved_input_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  savedInputId: uuid('saved_input_id')
    .notNull()
    .references(() => savedInputs.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  promptText: text('prompt_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  savedInputVersionId: uuid('saved_input_version_id')
    .notNull()
    .references(() => savedInputVersions.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const runs = pgTable('runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  personaVersionId: uuid('persona_version_id')
    .notNull()
    .references(() => personaVersions.id, { onDelete: 'restrict' }),
  savedInputVersionId: uuid('saved_input_version_id')
    .notNull()
    .references(() => savedInputVersions.id, { onDelete: 'restrict' }),
  model: text('model').notNull(),
  status: runStatus('status').notNull().default('pending'),
  output: text('output'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const projectsRelations = relations(projects, ({ many }) => ({
  personas: many(personas),
  savedInputs: many(savedInputs),
  runs: many(runs),
}))

export const personasRelations = relations(personas, ({ one, many }) => ({
  project: one(projects, {
    fields: [personas.projectId],
    references: [projects.id],
  }),
  versions: many(personaVersions),
}))

export const personaVersionsRelations = relations(
  personaVersions,
  ({ one, many }) => ({
    persona: one(personas, {
      fields: [personaVersions.personaId],
      references: [personas.id],
    }),
    runs: many(runs),
  }),
)

export const savedInputsRelations = relations(savedInputs, ({ one, many }) => ({
  project: one(projects, {
    fields: [savedInputs.projectId],
    references: [projects.id],
  }),
  versions: many(savedInputVersions),
}))

export const savedInputVersionsRelations = relations(
  savedInputVersions,
  ({ one, many }) => ({
    savedInput: one(savedInputs, {
      fields: [savedInputVersions.savedInputId],
      references: [savedInputs.id],
    }),
    attachments: many(attachments),
    runs: many(runs),
  }),
)

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  savedInputVersion: one(savedInputVersions, {
    fields: [attachments.savedInputVersionId],
    references: [savedInputVersions.id],
  }),
}))

export const runsRelations = relations(runs, ({ one }) => ({
  project: one(projects, {
    fields: [runs.projectId],
    references: [projects.id],
  }),
  personaVersion: one(personaVersions, {
    fields: [runs.personaVersionId],
    references: [personaVersions.id],
  }),
  savedInputVersion: one(savedInputVersions, {
    fields: [runs.savedInputVersionId],
    references: [savedInputVersions.id],
  }),
}))
