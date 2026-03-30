import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock instance
const mockStream = vi.fn();

// Mock the Anthropic SDK as a class
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      constructor() {}
      messages = {
        stream: mockStream,
      };
    },
  };
});

import { createAnthropicProvider } from './anthropic.js';

describe('createAnthropicProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create provider with chat function', () => {
    const provider = createAnthropicProvider('test-api-key');
    expect(provider.chat).toBeDefined();
  });

  describe('chat', () => {
    it('should stream response chunks', async () => {
      mockStream.mockReturnValue(
        (async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' World' } };
        })()
      );

      const provider = createAnthropicProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' World']);
    });

    it('should skip non-text delta events', async () => {
      mockStream.mockReturnValue(
        (async function* () {
          yield { type: 'message_start', message: {} };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
          yield { type: 'content_block_start', content_block: {} };
          yield { type: 'content_block_delta', delta: { type: 'input_json_delta', partial_json: '{}' } };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' World' } };
          yield { type: 'message_delta', delta: {} };
        })()
      );

      const provider = createAnthropicProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' World']);
    });

    it('should include system prompt when provided', async () => {
      mockStream.mockReturnValue(
        (async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Response' } };
        })()
      );

      const provider = createAnthropicProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages, { systemPrompt: 'Be helpful' })) {
        chunks.push(chunk);
      }

      expect(mockStream).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'Be helpful',
          max_tokens: 4096,
        })
      );
    });

    it('should map roles correctly', async () => {
      mockStream.mockReturnValue(
        (async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Response' } };
        })()
      );

      const provider = createAnthropicProvider('test-api-key');
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi!' },
        { role: 'user' as const, content: 'How are you?' },
      ];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(mockStream).toHaveBeenCalledWith(
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
