import { createGeminiProvider } from './gemini.js';
import { createOpenAIProvider } from './openai.js';
import { createAnthropicProvider } from './anthropic.js';
import type { LLMProvider } from './types.js';

export type { LLMMessage, LLMProvider, LLMChatOptions } from './types.js';

export type LLMProviderType = 'gemini' | 'openai' | 'anthropic';

export const LLM_PROVIDERS: { id: LLMProviderType; name: string }[] = [
  { id: 'gemini', name: 'Gemini' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Claude' },
];

export function createLLMProvider(type: LLMProviderType = 'gemini'): LLMProvider {
  switch (type) {
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      return createGeminiProvider(apiKey);
    }
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      return createOpenAIProvider(apiKey);
    }
    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not set');
      }
      return createAnthropicProvider(apiKey);
    }
    default:
      throw new Error(`Unknown LLM provider: ${type}`);
  }
}
