import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { AuthContext } from './auth-context'
import type { AuthContextValue } from './auth-context'
import { getAuthClient } from './supabase-adapter'
import type { AuthClient, AuthSession } from './types'

interface AuthProviderProps {
  /** Injectable for tests; defaults to the Supabase adapter singleton. */
  client?: AuthClient
  children: ReactNode
}

export function AuthProvider({ client, children }: AuthProviderProps) {
  const [auth] = useState<AuthClient>(() => client ?? getAuthClient())
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void auth.getSession().then((initial) => {
      if (cancelled) return
      setSession(initial)
      setLoading(false)
    })
    // `loading` resolves only via getSession above — auth-state events can
    // carry the persisted-but-unverified session before verification settles.
    const unsubscribe = auth.onAuthStateChange((next) => {
      if (!cancelled) setSession(next)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [auth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn: (email, password) => auth.signIn(email, password),
      signOut: () => auth.signOut(),
    }),
    [auth, session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
