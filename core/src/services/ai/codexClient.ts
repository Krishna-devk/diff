import { Codex } from '@openai/codex-sdk'

const codexClient = new Codex()

export function getCodexClient(): Codex {
  return codexClient
}

export function getCodexThread(model?: string) {
  const client = getCodexClient()
  return model ? client.startThread({ model }) : client.startThread()
}
