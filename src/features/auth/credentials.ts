import 'server-only'
import { DUMMY_HASH, matchesHash, normalizeEmail, userIdForEmail } from './hash.mjs'

// AUTH_USERS is a comma-separated list of `email:salt:hash` entries. Salt and
// hash are hex, so the only ':' characters are the two separators.
function getAllowlist(): Map<string, string> {
  const raw = process.env.AUTH_USERS ?? ''
  const entries = new Map<string, string>()

  for (const entry of raw.split(',')) {
    const trimmed = entry.trim()
    if (!trimmed) continue

    const [email, salt, hash] = trimmed.split(':')
    if (!email || !salt || !hash) continue

    entries.set(normalizeEmail(email), `${salt}:${hash}`)
  }
  return entries
}

export async function verifyCredentials(email: string, password: string): Promise<string | null> {
  const storedHash = getAllowlist().get(normalizeEmail(email))

  // Always run the comparison, even with no match, so timing doesn't reveal
  // which emails are on the allowlist.
  const isMatch = await matchesHash(password, storedHash ?? DUMMY_HASH)
  return isMatch && storedHash ? userIdForEmail(email) : null
}
