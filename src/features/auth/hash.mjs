// Shared by src/features/auth/credentials.ts and scripts/add-user.mjs.
// Plain .mjs so the Node script can import it without a build step — one
// implementation instead of two that must be kept identical by hand.
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

// Fixed valid-shaped hash to verify against when no entry matches the given
// email, so a login attempt takes the same time whether or not the email is
// registered (no timing side-channel revealing who has access).
export const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

// Opaque, stable, dot-free user id. Dot-free matters: the session cookie is
// `userId.issuedAtMs.signature` split on '.', so an email as the id would
// break the parse. Hashing also keeps the email out of the cookie.
export function userIdForEmail(email) {
  return createHash('sha256').update(normalizeEmail(email)).digest('hex').slice(0, 16)
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function matchesHash(password, storedHash) {
  const [salt, hashHex] = storedHash.split(':')
  if (!salt || !hashHex) return false

  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH)
  const storedKey = Buffer.from(hashHex, 'hex')
  if (derivedKey.length !== storedKey.length) return false

  return timingSafeEqual(derivedKey, storedKey)
}
