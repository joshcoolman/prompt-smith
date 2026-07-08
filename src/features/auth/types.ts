// The vendor-agnostic auth contract. Everything outside this feature (and the
// provider/routes inside it) programs against these types only — vendor SDKs
// stay inside adapter files.

export interface AuthUser {
  id: string
  email: string | null
}

export interface AuthSession {
  user: AuthUser
  /** Epoch seconds; null if the vendor doesn't report expiry. */
  expiresAt: number | null
}

export interface SignInResult {
  session: AuthSession | null
  /** Human-readable message; null on success. */
  error: string | null
}

export type Unsubscribe = () => void

export interface AuthClient {
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
  getSession: () => Promise<AuthSession | null>
  onAuthStateChange: (
    callback: (session: AuthSession | null) => void,
  ) => Unsubscribe
}
