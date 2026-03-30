import { createGeminiProvider } from './gemini.js';
import type { LLMProvider } from './types.js';

export type { LLMMessage, LLMProvider } from './types.js';

export type LLMProviderType = 'gemini';

export function createLLMProvider(type: LLMProviderType = 'gemini'): LLMProvider {
  switch (type) {
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      return createGeminiProvider(apiKey);
    }
    default:
      throw new Error(`Unknown LLM provider: ${type}`);
  }
}
