'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCredentials } from './credentials'
import { createSessionValue, SESSION_COOKIE_NAME, sessionCookieOptions } from './session'

export type LoginState = { error: string | null; email: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const userId = await verifyCredentials(email, password)
  // One message for both cases — never reveal whether the email is known.
  if (!userId) return { error: 'Invalid email or password', email }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, await createSessionValue(userId), sessionCookieOptions())
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', { ...sessionCookieOptions(), maxAge: 0 })
  redirect('/login')
}
