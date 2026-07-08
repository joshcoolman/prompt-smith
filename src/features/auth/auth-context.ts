import { createContext, useContext } from 'react'

import type { AuthSession, AuthUser, SignInResult } from './types'

export interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  /** True until the initial session check resolves — gate redirects on this. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
