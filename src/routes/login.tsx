import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useAuth } from '#/features/auth'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = redirect ?? '/'

  useEffect(() => {
    if (!loading && user) void router.history.push(destination)
  }, [loading, user, destination, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signIn(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    void router.history.push(destination)
  }

  return (
    <main className="bg-bg text-text flex min-h-screen flex-col items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="border-border bg-surface flex w-full max-w-sm flex-col gap-4 rounded-md border p-8"
      >
        <h1 className="house-section">Sign in</h1>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted font-mono text-xs">email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-border bg-bg text-text focus:border-accent rounded-md border px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted font-mono text-xs">password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-border bg-bg text-text focus:border-accent rounded-md border px-3 py-2 text-sm outline-none"
          />
        </label>

        {error && (
          <p role="alert" className="text-accent font-mono text-xs">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-accent-contrast rounded-md px-3 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
