// Phase 2 proof: persona + input + model choice -> raw output, callable
// outside the UI. Gated by the same Supabase session as the browser app —
// the server-side counterpart to src/routes/index.tsx's beforeLoad guard,
// verified here via bearer token since this route has no browser session.
import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

import { runAnthropicCompletion } from '#/features/ai'
import type { RunInput } from '#/features/ai'

async function requireSession(request: Request): Promise<Response | null> {
  const url = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    return Response.json({ error: 'Auth is not configured' }, { status: 500 })
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return Response.json({ error: 'Missing bearer token' }, { status: 401 })
  }

  const supabase = createClient(url, serviceRoleKey)
  const { error } = await supabase.auth.getUser(token)
  if (error) {
    return Response.json({ error: 'Invalid session' }, { status: 401 })
  }

  return null
}

export const Route = createFileRoute('/api/run')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = await requireSession(request)
        if (unauthorized) return unauthorized

        const body = (await request.json()) as Partial<RunInput>
        if (!body.model || !body.prompt) {
          return Response.json(
            { error: 'model and prompt are required' },
            { status: 400 },
          )
        }

        try {
          const output = await runAnthropicCompletion({
            model: body.model,
            systemPrompt: body.systemPrompt,
            prompt: body.prompt,
            attachments: body.attachments,
          })
          return Response.json(output)
        } catch (error) {
          return Response.json(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
