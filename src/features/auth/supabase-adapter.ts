// The one file that knows about Supabase. Lazy and env-tolerant: with no
// VITE_SUPABASE_* env vars (CI, fresh clone) nothing throws — the app just
// behaves signed-out and signIn explains how to configure.

import { createClient } from '@supabase/supabase-js'
import type { Session, SupabaseClient } from '@supabase/supabase-js'

import type { AuthClient, AuthSession } from './types'

const NOT_CONFIGURED =
  'Auth is not configured — run pnpm setup:supabase, then restart pnpm dev.'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  // Literal property access only — Vite doesn't replace dynamic env keys.
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return (supabase ??= createClient(url, key))
}

function toSession(session: Session | null): AuthSession | null {
  if (!session) return null
  return {
    user: { id: session.user.id, email: session.user.email ?? null },
    expiresAt: session.expires_at ?? null,
  }
}

// The persisted localStorage session can outlive its user (deleted account,
// setup re-run against a different Supabase project). Verify with the server
// once per page load; every later getSession() stays local so route guards
// don't pay a network round-trip per navigation.
let verifiedThisLoad = false

export function createSupabaseAuthClient(): AuthClient {
  return {
    async signIn(email, password) {
      const client = getSupabase()
      if (!client) return { session: null, error: NOT_CONFIGURED }
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { session: null, error: error.message }
      return { session: toSession(data.session), error: null }
    },

    async signOut() {
      await getSupabase()?.auth.signOut()
    },

    async getSession() {
      const client = getSupabase()
      if (!client) return null
      const { data } = await client.auth.getSession()
      if (!data.session) return null
      if (!verifiedThisLoad) {
        verifiedThisLoad = true
        const { error } = await client.auth.getUser()
        if (error) {
          await client.auth.signOut()
          return null
        }
      }
      return toSession(data.session)
    },

    onAuthStateChange(callback) {
      const client = getSupabase()
      if (!client) {
        callback(null)
        return () => {}
      }
      // Never await other auth calls inside this callback — supabase-js
      // holds a lock while dispatching and deadlocks.
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(toSession(session))
      })
      return () => data.subscription.unsubscribe()
    },
  }
}

let authClient: AuthClient | null = null

export function getAuthClient(): AuthClient {
  return (authClient ??= createSupabaseAuthClient())
}
