import { beforeAll, describe, expect, it } from 'vitest'
import { hashPassword, userIdForEmail } from '#/features/auth/hash.mjs'
import { verifyCredentials } from '#/features/auth/credentials'

const EMAIL = 'josh@example.com'
const PASSWORD = 'correct-horse-battery'
const OTHER_EMAIL = 'friend@example.com'
const OTHER_PASSWORD = 'another-good-password'

beforeAll(async () => {
  // Round-trip through hash.mjs — the same module scripts/add-user.mjs uses.
  // This is what catches drift between the script and the app.
  const entries = [
    `${EMAIL}:${await hashPassword(PASSWORD)}`,
    'malformed-entry-without-colons',
    `${OTHER_EMAIL}:${await hashPassword(OTHER_PASSWORD)}`,
  ]
  process.env.AUTH_USERS = entries.join(',')
})

describe('verifyCredentials', () => {
  it('returns a stable opaque id for the correct password', async () => {
    expect(await verifyCredentials(EMAIL, PASSWORD)).toBe(userIdForEmail(EMAIL))
  })

  it('returns null for the wrong password', async () => {
    expect(await verifyCredentials(EMAIL, 'wrong-password')).toBeNull()
  })

  it('returns null for an unknown email', async () => {
    expect(await verifyCredentials('nobody@example.com', PASSWORD)).toBeNull()
  })

  it('resolves a second entry in the list, skipping the malformed one', async () => {
    expect(await verifyCredentials(OTHER_EMAIL, OTHER_PASSWORD)).toBe(userIdForEmail(OTHER_EMAIL))
  })

  it('matches email case-insensitively', async () => {
    expect(await verifyCredentials('JOSH@Example.COM', PASSWORD)).toBe(userIdForEmail(EMAIL))
  })
})
