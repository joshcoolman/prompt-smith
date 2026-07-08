import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getAuthClient, useAuth } from '#/features/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const session = await getAuthClient().getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  // beforeLoad only runs on navigation — this catches a session that dies
  // while the user is parked here (signed out elsewhere, token revoked).
  useEffect(() => {
    if (!loading && !user)
      void navigate({ to: '/login', search: { redirect: undefined } })
  }, [loading, user, navigate])

  return (
    <main className="bg-bg text-text flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="house-section">Dashboard</h1>
      <p className="text-text-muted text-sm">
        Signed in{user?.email ? ` as ${user.email}` : ''}. Nothing here yet —
        this is where the first real feature lands.
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-accent font-mono text-xs underline decoration-[var(--accent-soft)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
      >
        sign out →
      </button>
    </main>
  )
}
