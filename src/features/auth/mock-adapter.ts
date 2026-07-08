// In-memory AuthClient for tests — no network, no vendor SDK. Deliberately not
// exported from index.ts; it exists to test the contract and the provider.

import type { AuthClient, AuthSession, Unsubscribe } from './types'

export interface MockCredentials {
  email: string
  password: string
}

export function createMockAuthClient(
  valid: MockCredentials,
  options: { initialSession?: AuthSession | null } = {},
): AuthClient {
  let session: AuthSession | null = options.initialSession ?? null
  const listeners = new Set<(session: AuthSession | null) => void>()

  const emit = () => {
    for (const listener of listeners) listener(session)
  }

  return {
    async signIn(email, password) {
      if (email !== valid.email || password !== valid.password) {
        return { session: null, error: 'Invalid login credentials' }
      }
      session = {
        user: { id: 'mock-user-id', email },
        expiresAt: null,
      }
      emit()
      return { session, error: null }
    },

    async signOut() {
      session = null
      emit()
    },

    async getSession() {
      return session
    },

    onAuthStateChange(callback): Unsubscribe {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }
}
