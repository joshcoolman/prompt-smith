// Prints an AUTH_USERS entry for a new person. Provisioning IS the allowlist —
// there is no signup route, so this is the only way to grant access.
// Usage: pnpm auth:add-user '<email>' '<password>'
import { hashPassword, normalizeEmail, userIdForEmail } from '../src/features/auth/hash.mjs'

const [email, password] = process.argv.slice(2)

if (!email || !email.includes('@') || !password || password.length < 8) {
  console.error("Usage: pnpm auth:add-user '<email>' '<password>'  (password min 8 chars)")
  process.exit(1)
}

const entry = `${normalizeEmail(email)}:${await hashPassword(password)}`

console.log('\n  Add this to AUTH_USERS (comma-separated if there are others):\n')
console.log(`  ${entry}\n`)
console.log(`  user id: ${userIdForEmail(email)}`)
console.log('  Set it in .env.local and on the host, then redeploy.\n')
