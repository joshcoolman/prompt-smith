import { cookies } from 'next/headers'
import 'server-only'
import { SESSION_COOKIE_NAME, verifySessionValue } from './session'

// Server actions / RSCs only — never imported by proxy.ts, which reads
// ./session directly and only needs validity, not identity.
export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies()
  const session = await verifySessionValue(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) throw new Error('Not authenticated')
  return session.userId
}
