import { env } from '../../config/env'

export interface CodexThread {
  run(prompt: string): Promise<string>
}

class CustomCodexThread implements CodexThread {
  private model: string

  constructor(model: string = 'llama-3.3-70b-versatile') {
    this.model = model
  }

  async run(prompt: string): Promise<string> {
    const isGroq = !!env.groqApiKey
    const apiKey = env.groqApiKey || env.openaiApiKey

    if (!apiKey) {
      throw new Error('Neither GROQ_API_KEY nor OPENAI_API_KEY is configured.')
    }

    // Determine the base URL and default model based on the key type
    let baseUrl = 'https://api.openai.com/v1/chat/completions'
    let modelToUse = this.model

    if (isGroq) {
      baseUrl = 'https://api.groq.com/openai/v1/chat/completions'
      // Map OpenAI codex model to Groq's high-speed llama model if necessary
      if (this.model.includes('codex') || this.model.includes('gpt')) {
        modelToUse = 'llama-3.3-70b-versatile'
      }
    } else {
      // Fallback for OpenAI
      if (this.model.includes('codex')) {
        modelToUse = 'gpt-4o-mini' // Standard fallback for general code understanding
      }
    }

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for deterministic code review/quizzes
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error (${response.status}): ${errorText}`)
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('API returned empty choice list or malformed response.')
      }

      return content
    } catch (error) {
      console.error('AI Request failed:', error)
      throw error
    }
  }
}

export function getCodexThread(model?: string): CodexThread {
  // If model is provided, use it, otherwise fall back to a good default
  return new CustomCodexThread(model)
}
