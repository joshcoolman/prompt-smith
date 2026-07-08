import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAuth } from './auth-context'
import { AuthProvider } from './auth-provider'
import { createMockAuthClient } from './mock-adapter'
import { createSupabaseAuthClient } from './supabase-adapter'
import type { AuthClient, AuthSession } from './types'

const CREDS = { email: 'me@example.com', password: 'hunter22' }

describe('AuthClient contract (mock adapter)', () => {
  it('signs in with valid credentials', async () => {
    const client = createMockAuthClient(CREDS)
    const result = await client.signIn(CREDS.email, CREDS.password)
    expect(result.error).toBeNull()
    expect(result.session?.user.email).toBe(CREDS.email)
    expect(await client.getSession()).toEqual(result.session)
  })

  it('returns an error string, not a session, on bad credentials', async () => {
    const client = createMockAuthClient(CREDS)
    const result = await client.signIn(CREDS.email, 'wrong')
    expect(result.session).toBeNull()
    expect(result.error).toMatch(/invalid/i)
    expect(await client.getSession()).toBeNull()
  })

  it('signOut clears the session', async () => {
    const client = createMockAuthClient(CREDS)
    await client.signIn(CREDS.email, CREDS.password)
    await client.signOut()
    expect(await client.getSession()).toBeNull()
  })

  it('notifies subscribers on sign-in and sign-out, and stops after unsubscribe', async () => {
    const client = createMockAuthClient(CREDS)
    const seen: Array<AuthSession | null> = []
    const unsubscribe = client.onAuthStateChange((session) =>
      seen.push(session),
    )

    await client.signIn(CREDS.email, CREDS.password)
    await client.signOut()
    expect(seen).toHaveLength(2)
    expect(seen[0]?.user.email).toBe(CREDS.email)
    expect(seen[1]).toBeNull()

    unsubscribe()
    await client.signIn(CREDS.email, CREDS.password)
    expect(seen).toHaveLength(2)
  })

  it('does not notify on failed sign-in', async () => {
    const client = createMockAuthClient(CREDS)
    const listener = vi.fn()
    client.onAuthStateChange(listener)
    await client.signIn(CREDS.email, 'wrong')
    expect(listener).not.toHaveBeenCalled()
  })
})

function Probe() {
  const { user, loading } = useAuth()
  if (loading) return <p>loading</p>
  return <p>{user ? `signed in as ${user.email}` : 'signed out'}</p>
}

function renderWithProvider(client: AuthClient) {
  let auth!: ReturnType<typeof useAuth>
  function Capture() {
    auth = useAuth()
    return null
  }
  const view = render(
    <AuthProvider client={client}>
      <Probe />
      <Capture />
    </AuthProvider>,
  )
  return { view, auth: () => auth }
}

describe('AuthProvider / useAuth', () => {
  it('starts loading, then settles signed out', async () => {
    renderWithProvider(createMockAuthClient(CREDS))
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('signed out')).toBeInTheDocument()
  })

  it('restores an existing session', async () => {
    const client = createMockAuthClient(CREDS, {
      initialSession: {
        user: { id: 'u1', email: CREDS.email },
        expiresAt: null,
      },
    })
    renderWithProvider(client)
    expect(
      await screen.findByText(`signed in as ${CREDS.email}`),
    ).toBeInTheDocument()
  })

  it('surfaces the user after signIn and clears it after signOut', async () => {
    const { auth } = renderWithProvider(createMockAuthClient(CREDS))
    await screen.findByText('signed out')

    await act(() => auth().signIn(CREDS.email, CREDS.password))
    expect(screen.getByText(`signed in as ${CREDS.email}`)).toBeInTheDocument()

    await act(() => auth().signOut())
    expect(screen.getByText('signed out')).toBeInTheDocument()
  })

  it('useAuth throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/inside <AuthProvider>/)
    spy.mockRestore()
  })
})

describe('Supabase adapter without env vars', () => {
  // CI has no env and no network — the adapter must degrade, never throw.
  it('reports signed out and a helpful signIn error', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    try {
      const client = createSupabaseAuthClient()
      expect(await client.getSession()).toBeNull()

      const result = await client.signIn('a@b.c', 'password')
      expect(result.session).toBeNull()
      expect(result.error).toMatch(/not configured/i)

      const listener = vi.fn()
      const unsubscribe = client.onAuthStateChange(listener)
      expect(listener).toHaveBeenCalledWith(null)
      expect(() => unsubscribe()).not.toThrow()

      await expect(client.signOut()).resolves.toBeUndefined()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
