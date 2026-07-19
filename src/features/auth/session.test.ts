import { beforeAll, describe, expect, it } from 'vitest'
import { createSessionValue, verifySessionValue } from '#/features/auth/session'

const USER_ID = 'a1b2c3d4e5f60718'

beforeAll(() => {
  process.env.AUTH_SESSION_SECRET = 'test-secret'
})

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

describe('session', () => {
  it('verifies a freshly created value and returns its userId', async () => {
    const value = await createSessionValue(USER_ID)
    expect(await verifySessionValue(value)).toEqual({
      userId: USER_ID,
      issuedAtMs: expect.any(Number),
    })
  })

  it('rejects a tampered signature', async () => {
    const [userId, issuedAt, sig] = (await createSessionValue(USER_ID)).split('.')
    const flipped = `${sig!.slice(0, -1)}${sig!.at(-1) === '0' ? '1' : '0'}`
    expect(await verifySessionValue(`${userId}.${issuedAt}.${flipped}`)).toBeNull()
  })

  it('rejects a tampered userId even with the original signature', async () => {
    const [, issuedAt, sig] = (await createSessionValue(USER_ID)).split('.')
    expect(await verifySessionValue(`ffffffffffffffff.${issuedAt}.${sig}`)).toBeNull()
  })

  it('rejects an expired timestamp even with a valid signature', async () => {
    const expired = Date.now() - 31 * 24 * 60 * 60 * 1000
    const sig = await hmacHex(`${USER_ID}.${expired}`, 'test-secret')
    expect(await verifySessionValue(`${USER_ID}.${expired}.${sig}`)).toBeNull()
  })

  it('rejects malformed input without throwing', async () => {
    expect(await verifySessionValue(undefined)).toBeNull()
    expect(await verifySessionValue('')).toBeNull()
    expect(await verifySessionValue('not-a-valid-value')).toBeNull()
  })
})
