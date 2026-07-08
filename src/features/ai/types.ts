// The provider-agnostic run contract. Everything outside this feature
// programs against these types only — @effect/ai-anthropic stays inside
// anthropic-provider.ts.

export interface RunAttachment {
  mediaType: string
  /** Raw base64 (no `data:` URL prefix — the Anthropic adapter passes strings through as-is). */
  data: string
  fileName?: string
}

export interface RunInput {
  model: string
  systemPrompt?: string
  prompt: string
  attachments?: RunAttachment[]
}

export interface RunOutput {
  text: string
  model: string
  finishReason: string
  usage: {
    inputTokens: number | undefined
    outputTokens: number | undefined
  }
}
