import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLLMProvider, LLM_PROVIDERS } from './index.js';

describe('LLM Provider Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('LLM_PROVIDERS', () => {
    it('should have three providers', () => {
      expect(LLM_PROVIDERS).toHaveLength(3);
    });

    it('should include gemini provider', () => {
      const gemini = LLM_PROVIDERS.find((p) => p.id === 'gemini');
      expect(gemini).toBeDefined();
      expect(gemini?.name).toBe('Gemini');
    });

    it('should include openai provider', () => {
      const openai = LLM_PROVIDERS.find((p) => p.id === 'openai');
      expect(openai).toBeDefined();
      expect(openai?.name).toBe('OpenAI');
    });

    it('should include anthropic provider', () => {
      const anthropic = LLM_PROVIDERS.find((p) => p.id === 'anthropic');
      expect(anthropic).toBeDefined();
      expect(anthropic?.name).toBe('Claude');
    });
  });

  describe('createLLMProvider', () => {
    describe('gemini provider', () => {
      it('should throw error when GEMINI_API_KEY is not set', () => {
        delete process.env.GEMINI_API_KEY;

        expect(() => createLLMProvider('gemini')).toThrow(
          'GEMINI_API_KEY is not set'
        );
      });

      it('should create gemini provider when API key is set', () => {
        process.env.GEMINI_API_KEY = 'test-api-key';

        const provider = createLLMProvider('gemini');

        expect(provider).toBeDefined();
        expect(provider.chat).toBeDefined();
        expect(typeof provider.chat).toBe('function');
      });

      it('should use gemini as default provider type', () => {
        process.env.GEMINI_API_KEY = 'test-api-key';

        const provider = createLLMProvider();

        expect(provider).toBeDefined();
      });
    });

    describe('openai provider', () => {
      it('should throw error when OPENAI_API_KEY is not set', () => {
        delete process.env.OPENAI_API_KEY;

        expect(() => createLLMProvider('openai')).toThrow(
          'OPENAI_API_KEY is not set'
        );
      });

      it('should create openai provider when API key is set', () => {
        process.env.OPENAI_API_KEY = 'test-api-key';

        const provider = createLLMProvider('openai');

        expect(provider).toBeDefined();
        expect(provider.chat).toBeDefined();
        expect(typeof provider.chat).toBe('function');
      });
    });

    describe('anthropic provider', () => {
      it('should throw error when ANTHROPIC_API_KEY is not set', () => {
        delete process.env.ANTHROPIC_API_KEY;

        expect(() => createLLMProvider('anthropic')).toThrow(
          'ANTHROPIC_API_KEY is not set'
        );
      });

      it('should create anthropic provider when API key is set', () => {
        process.env.ANTHROPIC_API_KEY = 'test-api-key';

        const provider = createLLMProvider('anthropic');

        expect(provider).toBeDefined();
        expect(provider.chat).toBeDefined();
        expect(typeof provider.chat).toBe('function');
      });
    });

    describe('unknown provider', () => {
      it('should throw error for unknown provider type', () => {
        expect(() => createLLMProvider('unknown' as any)).toThrow(
          'Unknown LLM provider: unknown'
        );
      });
    });
  });
});
