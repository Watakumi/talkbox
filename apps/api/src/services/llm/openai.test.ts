import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock instance
const mockCreate = vi.fn();

// Mock the OpenAI SDK as a class
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      constructor() {}
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

import { createOpenAIProvider } from './openai.js';

describe('createOpenAIProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create provider with chat function', () => {
    const provider = createOpenAIProvider('test-api-key');
    expect(provider.chat).toBeDefined();
  });

  describe('chat', () => {
    it('should stream response chunks', async () => {
      mockCreate.mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' World' } }] };
        })()
      );

      const provider = createOpenAIProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' World']);
    });

    it('should skip empty content chunks', async () => {
      mockCreate.mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: '' } }] };
          yield { choices: [{ delta: { content: null } }] };
          yield { choices: [{ delta: {} }] };
          yield { choices: [{}] };
          yield { choices: [] };
          yield { choices: [{ delta: { content: 'World' } }] };
        })()
      );

      const provider = createOpenAIProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', 'World']);
    });

    it('should include system prompt when provided', async () => {
      mockCreate.mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] };
        })()
      );

      const provider = createOpenAIProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages, { systemPrompt: 'Be helpful' })) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: 'Be helpful' },
          ]),
          stream: true,
        })
      );
    });

    it('should not include system message when no prompt', async () => {
      mockCreate.mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] };
        })()
      );

      const provider = createOpenAIProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hi' }],
        })
      );
    });

    it('should map assistant role correctly', async () => {
      mockCreate.mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] };
        })()
      );

      const provider = createOpenAIProvider('test-api-key');
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi!' },
        { role: 'user' as const, content: 'How are you?' },
      ];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi!' },
            { role: 'user', content: 'How are you?' },
          ],
        })
      );
    });
  });
});
