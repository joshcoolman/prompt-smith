import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { getAuthClient, useAuth } from '#/features/auth'
import {
  createPersona,
  createPersonaVersion,
  createSavedInput,
  createSavedInputVersion,
  getProjectDetail,
} from '#/features/projects'
import type { Persona, SavedInput } from '#/features/projects'
import { createRun, listRuns } from '#/features/runs'
import type { Run } from '#/features/runs'

const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
]

const inputClass =
  'border-border bg-bg text-text focus:border-accent rounded-md border px-3 py-2 text-sm outline-none'
const primaryButtonClass =
  'bg-accent text-accent-contrast rounded-md px-3 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50'
const secondaryButtonClass =
  'text-accent font-mono text-xs underline decoration-[var(--accent-soft)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]'

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export const Route = createFileRoute('/projects/$projectId')({
  beforeLoad: async ({ location }) => {
    const session = await getAuthClient().getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  loader: async ({ params }) => {
    const [detail, runs] = await Promise.all([
      getProjectDetail({ data: { projectId: params.projectId } }),
      listRuns({ data: { projectId: params.projectId } }),
    ])
    return { detail, runs }
  },
  component: ProjectWorkspace,
})

function ProjectWorkspace() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const router = useRouter()
  const { detail, runs } = Route.useLoaderData()

  useEffect(() => {
    if (!loading && !user)
      void navigate({ to: '/login', search: { redirect: undefined } })
  }, [loading, user, navigate])

  async function invalidate() {
    await router.invalidate()
  }

  return (
    <main className="bg-bg text-text min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header>
          <Link to="/" className={secondaryButtonClass}>
            ← projects
          </Link>
          <h1 className="house-section mt-2">{detail.project.name}</h1>
        </header>

        <PersonaPanel
          projectId={detail.project.id}
          personas={detail.personas}
          onChange={invalidate}
        />

        <SavedInputPanel
          projectId={detail.project.id}
          savedInputs={detail.savedInputs}
          onChange={invalidate}
        />

        <RunPanel
          projectId={detail.project.id}
          personas={detail.personas}
          savedInputs={detail.savedInputs}
          runs={runs}
          onChange={invalidate}
        />
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Personas
// ─────────────────────────────────────────────────────────────────────────

function PersonaPanel({
  projectId,
  personas,
  onChange,
}: {
  projectId: string
  personas: Persona[]
  onChange: () => Promise<void>
}) {
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newName.trim() || !newPrompt.trim()) return
    setSaving(true)
    await createPersona({
      data: { projectId, name: newName.trim(), systemPrompt: newPrompt },
    })
    setNewName('')
    setNewPrompt('')
    setNewOpen(false)
    setSaving(false)
    await onChange()
  }

  function startEdit(persona: Persona) {
    setEditingId(persona.id)
    setEditDraft(persona.versions[0]?.systemPrompt ?? '')
  }

  async function handleSaveVersion(personaId: string) {
    if (!editDraft.trim()) return
    setSaving(true)
    await createPersonaVersion({
      data: { personaId, systemPrompt: editDraft },
    })
    setEditingId(null)
    setSaving(false)
    await onChange()
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-text font-medium">Personas</h2>
        <button
          type="button"
          onClick={() => setNewOpen((v) => !v)}
          className={secondaryButtonClass}
        >
          {newOpen ? 'cancel' : '+ new persona'}
        </button>
      </div>

      {newOpen && (
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="System prompt"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows={4}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving || !newName.trim() || !newPrompt.trim()}
            className={`${primaryButtonClass} self-start`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {personas.length === 0 && !newOpen && (
        <p className="text-text-muted text-sm">No personas yet.</p>
      )}

      <ul className="flex flex-col gap-2">
        {personas.map((persona) => {
          const latest = persona.versions[0]
          const isEditing = editingId === persona.id
          return (
            <li
              key={persona.id}
              className="border-border bg-surface rounded-md border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text text-sm font-medium">
                    {persona.name}{' '}
                    <span className="text-text-faint font-mono text-xs">
                      v{latest?.version ?? 0} · {persona.versions.length}{' '}
                      version{persona.versions.length === 1 ? '' : 's'}
                    </span>
                  </p>
                  {!isEditing && (
                    <p className="text-text-muted mt-1 text-sm">
                      {truncate(latest?.systemPrompt ?? '', 160)}
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(persona)}
                    className={secondaryButtonClass}
                  >
                    edit
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={5}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving || !editDraft.trim()}
                      onClick={() => void handleSaveVersion(persona.id)}
                      className={primaryButtonClass}
                    >
                      {saving ? 'Saving…' : 'Save as new version'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={secondaryButtonClass}
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Saved Inputs
// ─────────────────────────────────────────────────────────────────────────

function SavedInputPanel({
  projectId,
  savedInputs,
  onChange,
}: {
  projectId: string
  savedInputs: SavedInput[]
  onChange: () => Promise<void>
}) {
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newName.trim() || !newPrompt.trim()) return
    setSaving(true)
    await createSavedInput({
      data: { projectId, name: newName.trim(), promptText: newPrompt },
    })
    setNewName('')
    setNewPrompt('')
    setNewOpen(false)
    setSaving(false)
    await onChange()
  }

  function startEdit(savedInput: SavedInput) {
    setEditingId(savedInput.id)
    setEditDraft(savedInput.versions[0]?.promptText ?? '')
  }

  async function handleSaveVersion(savedInputId: string) {
    if (!editDraft.trim()) return
    setSaving(true)
    await createSavedInputVersion({
      data: { savedInputId, promptText: editDraft },
    })
    setEditingId(null)
    setSaving(false)
    await onChange()
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-text font-medium">Saved Inputs</h2>
        <button
          type="button"
          onClick={() => setNewOpen((v) => !v)}
          className={secondaryButtonClass}
        >
          {newOpen ? 'cancel' : '+ new input'}
        </button>
      </div>

      {newOpen && (
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Prompt text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows={4}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving || !newName.trim() || !newPrompt.trim()}
            className={`${primaryButtonClass} self-start`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {savedInputs.length === 0 && !newOpen && (
        <p className="text-text-muted text-sm">No saved inputs yet.</p>
      )}

      <ul className="flex flex-col gap-2">
        {savedInputs.map((savedInput) => {
          const latest = savedInput.versions[0]
          const isEditing = editingId === savedInput.id
          return (
            <li
              key={savedInput.id}
              className="border-border bg-surface rounded-md border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text text-sm font-medium">
                    {savedInput.name}{' '}
                    <span className="text-text-faint font-mono text-xs">
                      v{latest?.version ?? 0} · {savedInput.versions.length}{' '}
                      version{savedInput.versions.length === 1 ? '' : 's'}
                    </span>
                  </p>
                  {!isEditing && (
                    <p className="text-text-muted mt-1 text-sm">
                      {truncate(latest?.promptText ?? '', 160)}
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(savedInput)}
                    className={secondaryButtonClass}
                  >
                    edit
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={5}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving || !editDraft.trim()}
                      onClick={() => void handleSaveVersion(savedInput.id)}
                      className={primaryButtonClass}
                    >
                      {saving ? 'Saving…' : 'Save as new version'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={secondaryButtonClass}
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────

function RunPanel({
  projectId,
  personas,
  savedInputs,
  runs,
  onChange,
}: {
  projectId: string
  personas: Persona[]
  savedInputs: SavedInput[]
  runs: Run[]
  onChange: () => Promise<void>
}) {
  const personaVersionOptions = useMemo(
    () =>
      personas.flatMap((persona) =>
        persona.versions.map((version) => ({
          id: version.id,
          label: `${persona.name} (v${version.version})`,
        })),
      ),
    [personas],
  )

  const savedInputVersionOptions = useMemo(
    () =>
      savedInputs.flatMap((savedInput) =>
        savedInput.versions.map((version) => ({
          id: version.id,
          label: `${savedInput.name} (v${version.version})`,
        })),
      ),
    [savedInputs],
  )

  const [personaVersionId, setPersonaVersionId] = useState('')
  const [savedInputVersionId, setSavedInputVersionId] = useState('')
  const [model, setModel] = useState(MODELS[0]!.id)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    if (!personaVersionOptions.some((o) => o.id === personaVersionId)) {
      setPersonaVersionId(personaVersionOptions[0]?.id ?? '')
    }
  }, [personaVersionOptions, personaVersionId])

  useEffect(() => {
    if (!savedInputVersionOptions.some((o) => o.id === savedInputVersionId)) {
      setSavedInputVersionId(savedInputVersionOptions[0]?.id ?? '')
    }
  }, [savedInputVersionOptions, savedInputVersionId])

  async function handleRun() {
    if (!personaVersionId || !savedInputVersionId) return
    setRunning(true)
    setRunError(null)
    try {
      const result = await createRun({
        data: {
          projectId,
          personaVersionId,
          savedInputVersionId,
          model,
        },
      })
      if (result?.status === 'error') {
        setRunError(result.errorMessage ?? 'Run failed')
      }
    } finally {
      setRunning(false)
      await onChange()
    }
  }

  const canRun =
    personaVersionOptions.length > 0 && savedInputVersionOptions.length > 0

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-text font-medium">Run</h2>

      {!canRun ? (
        <p className="text-text-muted text-sm">
          Add at least one persona and one saved input to run.
        </p>
      ) : (
        <div className="border-border bg-surface flex flex-col gap-3 rounded-md border p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={personaVersionId}
              onChange={(e) => setPersonaVersionId(e.target.value)}
              className={inputClass}
            >
              {personaVersionOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={savedInputVersionId}
              onChange={(e) => setSavedInputVersionId(e.target.value)}
              className={inputClass}
            >
              {savedInputVersionOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputClass}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={running}
            onClick={() => void handleRun()}
            className={`${primaryButtonClass} self-start`}
          >
            {running ? 'Running…' : 'Run'}
          </button>
          {runError && (
            <p role="alert" className="text-accent font-mono text-xs">
              {runError}
            </p>
          )}
        </div>
      )}

      <h3 className="text-text-muted mt-4 text-sm font-medium">History</h3>
      {runs.length === 0 ? (
        <p className="text-text-muted text-sm">No runs yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {runs.map((run) => (
            <li
              key={run.id}
              className="border-border bg-surface rounded-md border p-4"
            >
              <p className="text-text-faint font-mono text-xs">
                {run.personaVersion.persona.name} (v
                {run.personaVersion.version}) ×{' '}
                {run.savedInputVersion.savedInput.name} (v
                {run.savedInputVersion.version}) · {run.model} · {run.status}
              </p>
              {run.status === 'error' ? (
                <p className="text-accent mt-2 text-sm">{run.errorMessage}</p>
              ) : (
                <p className="text-text mt-2 whitespace-pre-wrap text-sm">
                  {run.output}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
