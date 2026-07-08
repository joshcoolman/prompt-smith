#!/usr/bin/env node
// Interactive auth setup: links (or creates) a hosted Supabase project, writes
// .env.local, and provisions the single login. Re-running is safe.
process.env.NODE_NO_WARNINGS = '1'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { input, confirm } from '@inquirer/prompts'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const capture = (cmd) =>
  execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] })
    .toString()
    .trim()
const canRun = (cmd) => {
  try {
    execSync(cmd, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
// The Supabase CLI prints `null` (not `[]`) for empty lists in JSON mode.
const listJson = (cmd) => JSON.parse(capture(cmd)) ?? []

// `--reveal` only exists on some CLI versions (others print full keys without
// it). Returns the key list, or null when no project is linked.
function fetchApiKeys() {
  for (const cmd of [
    'supabase projects api-keys --reveal --output json',
    'supabase projects api-keys --output json',
  ]) {
    try {
      return JSON.parse(capture(cmd)) ?? []
    } catch {
      /* unknown flag or not linked — try next */
    }
  }
  return null
}

// This repo's .env.local already holds DATABASE_URL (Drizzle) — merge the
// auth keys in rather than overwrite the file wholesale.
function writeEnvLocal(vars) {
  const existingLines = existsSync('.env.local')
    ? readFileSync('.env.local', 'utf8').split('\n')
    : []
  const keys = new Set(Object.keys(vars))
  const kept = existingLines.filter((line) => {
    const key = line.split('=')[0]?.trim()
    return !keys.has(key)
  })
  while (kept.length > 0 && kept[kept.length - 1].trim() === '') kept.pop()

  const authBlock = [
    '',
    '# Supabase Auth (this app\'s login gate) — written by pnpm setup:supabase',
    ...Object.entries(vars).map(([k, v]) => `${k}=${v}`),
  ]

  writeFileSync('.env.local', [...kept, ...authBlock].join('\n') + '\n')
}

console.log('\n┌──────────────────────────────────────┐')
console.log('│      prompt-smith auth setup wizard   │')
console.log('└──────────────────────────────────────┘\n')
console.log('This links a Supabase project for email/password login,')
console.log('writes .env.local, and creates your account (the only login).\n')

await confirm({ message: 'Ready to continue?', default: true })

// ── Check CLI ───────────────────────────────────────────────
console.log('\nChecking CLI...')
if (!canRun('supabase --version')) {
  console.log('\nMissing the Supabase CLI — install it first:\n')
  console.log('  brew install supabase/tap/supabase')
  console.log('\nThen re-run: pnpm setup:supabase')
  process.exit(1)
}
console.log('  ✓ Supabase CLI')

// ── Step 1: Log in ──────────────────────────────────────────
console.log('\n── 1/3  Supabase login ─────────────────────────\n')

if (!canRun('supabase projects list --output json')) {
  console.log('Log in to Supabase (opens browser).')
  console.log('  Note: macOS may ask if your terminal can access the Keychain.')
  console.log('  Click "Deny" — the login still works.\n')
  run('supabase login')
}
console.log('  ✓ Logged in\n')

// ── Step 2: Link or create a project ────────────────────────
console.log('── 2/3  Project ────────────────────────────────\n')

const isLinked = fetchApiKeys() !== null

if (!isLinked) {
  let projects = listJson('supabase projects list --output json')

  if (projects.length === 0) {
    console.log('  No Supabase projects found.\n')
    const createNew = await confirm({
      message: 'Create a new project now?',
      default: true,
    })

    if (createNew) {
      const orgs = listJson('supabase orgs list --output json')
      let orgId
      if (orgs.length === 0) {
        console.log('  No Supabase organizations found on this account.')
        console.log('  Create one at https://supabase.com/dashboard, then re-run.')
        process.exit(1)
      }
      if (orgs.length === 1) {
        orgId = orgs[0].id
        console.log(`  Using org: ${orgs[0].name}\n`)
      } else {
        orgs.forEach((o, i) => console.log(`  ${i + 1}. ${o.name}`))
        const pick = await input({
          message: 'Choose org number:',
          validate: (v) => (Number(v) >= 1 && Number(v) <= orgs.length) || 'Enter a valid number',
        })
        orgId = orgs[Number(pick) - 1].id
      }

      const projectName = await input({
        message: 'Project name:',
        default: 'prompt-smith',
      })

      const REGIONS = [
        { code: 'us-east-1', label: 'N. Virginia, USA' },
        { code: 'us-west-1', label: 'N. California, USA' },
        { code: 'us-west-2', label: 'Oregon, USA' },
        { code: 'eu-west-1', label: 'Ireland' },
        { code: 'eu-central-1', label: 'Frankfurt, Germany' },
        { code: 'ap-southeast-1', label: 'Singapore' },
        { code: 'ap-northeast-1', label: 'Tokyo, Japan' },
      ]
      console.log('\n  Regions:')
      REGIONS.forEach((r, i) => console.log(`  ${i + 1}. ${r.code.padEnd(18)} ${r.label}`))
      const regionInput = await input({
        message: 'Type the number next to your region:',
        default: '1',
      })
      const region = REGIONS[Number(regionInput) - 1]?.code ?? regionInput

      // Auth-only setup never needs this password again, but project creation
      // requires one and Supabase won't show it later — only reset it.
      console.log('\n  You need a database password for this project.')
      console.log('  Supabase does not let you retrieve it later — only reset it.')
      console.log('  Save it somewhere safe before continuing.\n')

      const dbPassword = await input({
        message: 'Database password (shown as typed):',
      })

      const border = '─'.repeat(dbPassword.length + 4)
      console.log(`\n  ┌${border}┐`)
      console.log(`  │  ${dbPassword}  │`)
      console.log(`  └${border}┘`)
      console.log('  ^ Save this password now — you will not see it again.\n')

      await confirm({ message: "I've saved my password, continue", default: true })

      console.log('\n  Creating project...')
      run(
        `supabase projects create "${projectName}" --org-id ${orgId} --db-password "${dbPassword}" --region ${region}`,
      )

      process.stdout.write('\n  Waiting for project to be ready')
      while (true) {
        await new Promise((r) => setTimeout(r, 3000))
        projects = listJson('supabase projects list --output json')
        if (projects.length > 0) break
        process.stdout.write('.')
      }
      console.log(' ✓')
    } else {
      console.log('  Create a free project at: https://supabase.com/dashboard/new/_\n')
      while (true) {
        projects = listJson('supabase projects list --output json')
        if (projects.length > 0) break
        await confirm({
          message: 'Press enter once your project is created',
          default: true,
        })
      }
    }
  }

  if (projects.length === 1) {
    run(`supabase link --project-ref ${projects[0].ref}`)
  } else {
    console.log('Select a project to link:\n')
    run('supabase link')
  }
}
console.log('  ✓ Project linked\n')

// ── Step 3: Keys → .env.local ───────────────────────────────
console.log('── 3/3  Keys ───────────────────────────────────\n')

const rawKeys = fetchApiKeys()
if (!rawKeys || rawKeys.length === 0) {
  console.error('  ✗ Could not read API keys from the linked project.')
  console.log('  Find them at: Supabase dashboard → Project settings → API keys')
  process.exit(1)
}
// Legacy projects return JWT keys labeled anon/service_role (under `id` or
// `name` depending on CLI version); newer projects return sb_publishable_* /
// sb_secret_* keys instead.
const findKey = (label, prefix) =>
  rawKeys.find((k) => k.id === label || k.name === label)?.api_key ??
  rawKeys.find((k) => k.api_key?.startsWith(prefix))?.api_key
const anon = findKey('anon', 'sb_publishable_')
const serviceRole = findKey('service_role', 'sb_secret_')

if (!anon || !serviceRole) {
  console.error('  ✗ Could not identify the anon + service_role keys.')
  console.log(`  Keys returned: ${rawKeys.map((k) => k.id ?? k.name).join(', ')}`)
  console.log('  Find them at: Supabase dashboard → Project settings → API keys')
  process.exit(1)
}
if (/\*|REDACTED/i.test(anon + serviceRole)) {
  console.error('  ✗ Your Supabase CLI redacts keys and is too old for --reveal.')
  console.log('  Upgrade it: brew upgrade supabase, then re-run pnpm setup:supabase')
  process.exit(1)
}

function deriveUrl() {
  // Legacy anon keys are JWTs whose payload carries the project ref.
  try {
    const payload = JSON.parse(Buffer.from(anon.split('.')[1], 'base64').toString())
    if (payload.ref) return { url: `https://${payload.ref}.supabase.co`, via: 'anon JWT' }
  } catch {
    /* not a JWT */
  }
  // `supabase link` writes the ref here.
  try {
    const ref = readFileSync('supabase/.temp/project-ref', 'utf8').trim()
    if (ref) return { url: `https://${ref}.supabase.co`, via: 'linked project ref' }
  } catch {
    /* no linked ref file */
  }
  return null
}

let derived = deriveUrl()
if (!derived) {
  const url = await input({
    message: 'Project URL (Supabase dashboard → Project settings → API):',
    validate: (v) => v.startsWith('https://') || 'Enter the full https:// URL',
  })
  derived = { url: url.replace(/\/$/, ''), via: 'manual entry' }
}
const supabaseUrl = derived.url
console.log(`  ✓ Project URL: ${supabaseUrl} (via ${derived.via})`)

writeEnvLocal({
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: serviceRole,
})
console.log('  ✓ .env.local written (points at your cloud project)')

// ── Create the single user ──────────────────────────────────
console.log('\n── Almost done! ────────────────────────────────\n')
console.log('Create your account (this is the only login — there is no signup):\n')

const email = await input({
  message: 'Email:',
  validate: (v) => v.includes('@') || 'Enter a valid email',
})
const pass = await input({
  message: 'Password (min 6 chars):',
  validate: (v) => v.length >= 6 || 'At least 6 characters',
})

const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceRole}`,
    apikey: serviceRole,
  },
  body: JSON.stringify({ email, password: pass, email_confirm: true }),
})

if (res.ok) {
  console.log(`\n  ✓ Account created: ${email}`)
} else {
  const err = await res.json().catch(() => ({}))
  const message = err.msg ?? err.message ?? ''
  if (/already.*registered/i.test(message)) {
    console.log(`\n  ✓ ${email} already exists — you're set.`)
  } else {
    console.error(`\n  ✗ Could not create account: ${message || 'unknown error'}`)
    console.log('  Create one manually: Supabase dashboard → Authentication → Users\n')
    process.exit(1)
  }
}

console.log('\n✓ Setup complete!')
console.log('  pnpm dev → http://localhost:3002/login\n')
