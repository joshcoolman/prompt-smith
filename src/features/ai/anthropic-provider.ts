// The one file that knows @effect/ai-anthropic. Server-only — never
// imported from client code, so ANTHROPIC_API_KEY never reaches the bundle.

import { AnthropicClient, AnthropicLanguageModel } from '@effect/ai-anthropic'
import { LanguageModel } from '@effect/ai'
import type { Prompt } from '@effect/ai'
import { FetchHttpClient } from '@effect/platform'
import { Config, Effect, Layer } from 'effect'

import type { RunInput, RunOutput } from './types'

const AnthropicClientLive = AnthropicClient.layerConfig({
  apiKey: Config.redacted('ANTHROPIC_API_KEY'),
}).pipe(Layer.provide(FetchHttpClient.layer))

function toPrompt(input: RunInput): Prompt.RawInput {
  const messages: Array<Prompt.MessageEncoded> = []

  if (input.systemPrompt) {
    messages.push({ role: 'system', content: input.systemPrompt })
  }

  const attachmentParts = (input.attachments ?? []).map(
    (attachment) =>
      ({
        type: 'file',
        mediaType: attachment.mediaType,
        fileName: attachment.fileName,
        data: attachment.data,
      }) as const,
  )

  messages.push({
    role: 'user',
    content: [{ type: 'text', text: input.prompt }, ...attachmentParts],
  })

  return messages
}

export async function runAnthropicCompletion(
  input: RunInput,
): Promise<RunOutput> {
  const ModelLive = AnthropicLanguageModel.layer({ model: input.model }).pipe(
    Layer.provide(AnthropicClientLive),
  )

  const program = Effect.gen(function* () {
    const response = yield* LanguageModel.generateText({
      prompt: toPrompt(input),
    })
    return {
      text: response.text,
      model: input.model,
      finishReason: response.finishReason,
      usage: {
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
      },
    }
  })

  return Effect.runPromise(program.pipe(Effect.provide(ModelLive)))
}
