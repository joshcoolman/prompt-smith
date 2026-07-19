'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '#/features/auth/actions'
import { appMeta } from '#/app-meta'

const initialState: LoginState = { error: null, email: '' }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <main className="bg-bg text-text flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        <h1 className="house-eyebrow mb-8 text-center">{appMeta.name}</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted font-mono text-xs">email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              // Echoed back from the action: React 19 resets uncontrolled
              // fields after every action call, so a failed login would
              // otherwise wipe what was typed.
              defaultValue={state.email}
              className="border-border bg-surface text-text focus:border-accent rounded-md border px-3 py-2 text-sm outline-none transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted font-mono text-xs">password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border-border bg-surface text-text focus:border-accent rounded-md border px-3 py-2 text-sm outline-none transition-colors"
            />
          </label>

          {state.error && (
            <p role="alert" className="text-accent font-mono text-xs">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-contrast mt-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
