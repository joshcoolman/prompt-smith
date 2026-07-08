import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getAuthClient, useAuth } from '#/features/auth'
import { createProject, deleteProject, listProjects } from '#/features/projects'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const session = await getAuthClient().getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  loader: () => listProjects(),
  component: ProjectsPage,
})

function ProjectsPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const router = useRouter()
  const projects = Route.useLoaderData()

  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // beforeLoad only runs on navigation — this catches a session that dies
  // while the user is parked here (signed out elsewhere, token revoked).
  useEffect(() => {
    if (!loading && !user)
      void navigate({ to: '/login', search: { redirect: undefined } })
  }, [loading, user, navigate])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setCreating(true)
    await createProject({ data: { name: trimmed } })
    setName('')
    setCreating(false)
    await router.invalidate()
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setConfirmDeleteId(null)
    await deleteProject({ data: { id } })
    await router.invalidate()
  }

  return (
    <main className="bg-bg text-text min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="house-section">Projects</h1>
            <p className="text-text-muted text-sm">
              Signed in{user?.email ? ` as ${user.email}` : ''}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-accent font-mono text-xs underline decoration-[var(--accent-soft)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
          >
            sign out →
          </button>
        </header>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="New project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-border bg-surface text-text focus:border-accent flex-1 rounded-md border px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="bg-accent text-accent-contrast rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>

        {projects.length === 0 ? (
          <p className="text-text-muted text-sm">
            No projects yet — create one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="border-border bg-surface flex items-center justify-between rounded-md border px-4 py-3"
              >
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="text-text hover:text-accent text-sm font-medium transition-colors"
                >
                  {project.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(project.id)}
                  className="text-text-faint hover:text-accent font-mono text-xs transition-colors"
                >
                  {confirmDeleteId === project.id ? 'confirm?' : 'delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
