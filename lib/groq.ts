import Groq from 'groq-sdk'

export const QUIZ_MODEL = 'openai/gpt-oss-120b'
export const QUIZ_FALLBACK = 'meta-llama/llama-4-scout-17b-16e-instruct'

let _client: Groq | null = null

export function getGroqClient(): Groq {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  }
  return _client
}
