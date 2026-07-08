// Public surface of the auth feature. Consumers import from here only —
// never from the adapter or other internals.

export type {
  AuthClient,
  AuthSession,
  AuthUser,
  SignInResult,
  Unsubscribe,
} from './types'
export { getAuthClient } from './supabase-adapter'
export { AuthProvider } from './auth-provider'
export { useAuth, type AuthContextValue } from './auth-context'
