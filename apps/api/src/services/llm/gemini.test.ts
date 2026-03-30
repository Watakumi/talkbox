import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock instance
const mockSendMessageStream = vi.fn();
const mockCreate = vi.fn();

// Mock the Google GenAI SDK as a class
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      constructor() {}
      chats = {
        create: mockCreate,
      };
    },
  };
});

import { createGeminiProvider } from './gemini.js';

describe('createGeminiProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockReturnValue({
      sendMessageStream: mockSendMessageStream,
    });
  });

  it('should create provider with chat function', () => {
    const provider = createGeminiProvider('test-api-key');
    expect(provider.chat).toBeDefined();
  });

  describe('chat', () => {
    it('should throw error when no messages provided', async () => {
      const provider = createGeminiProvider('test-api-key');

      const generator = provider.chat([]);
      await expect(generator.next()).rejects.toThrow('No messages provided');
    });

    it('should stream response chunks', async () => {
      mockSendMessageStream.mockResolvedValue(
        (async function* () {
          yield { text: 'Hello' };
          yield { text: ' World' };
        })()
      );

      const provider = createGeminiProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' World']);
    });

    it('should skip empty text chunks', async () => {
      mockSendMessageStream.mockResolvedValue(
        (async function* () {
          yield { text: 'Hello' };
          yield { text: '' };
          yield { text: null };
          yield { text: 'World' };
        })()
      );

      const provider = createGeminiProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', 'World']);
    });

    it('should include history for multi-turn conversation', async () => {
      mockSendMessageStream.mockResolvedValue(
        (async function* () {
          yield { text: 'Response' };
        })()
      );

      const provider = createGeminiProvider('test-api-key');
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' },
      ];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          history: [
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hi there!' }] },
          ],
        })
      );
    });

    it('should include system prompt when provided', async () => {
      mockSendMessageStream.mockResolvedValue(
        (async function* () {
          yield { text: 'Response' };
        })()
      );

      const provider = createGeminiProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages, { systemPrompt: 'Be helpful' })) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: { systemInstruction: 'Be helpful' },
        })
      );
    });

    it('should not include config when no system prompt', async () => {
      mockSendMessageStream.mockResolvedValue(
        (async function* () {
          yield { text: 'Response' };
        })()
      );

      const provider = createGeminiProvider('test-api-key');
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      const chunks: string[] = [];
      for await (const chunk of provider.chat(messages)) {
        chunks.push(chunk);
      }

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: undefined,
        })
      );
    });
  });
});
