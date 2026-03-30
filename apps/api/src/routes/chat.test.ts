import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { chatRoutes } from './chat.js';
import type { Env } from '../types/env.js';

// Mock the database module
vi.mock('../db/index.js', () => ({
  getDb: vi.fn(),
  conversations: { id: 'id', userId: 'userId' },
  messages: { id: 'id', conversationId: 'conversationId', role: 'role', content: 'content', createdAt: 'createdAt' },
}));

// Mock the LLM provider
vi.mock('../services/llm/index.js', () => ({
  createLLMProvider: vi.fn(),
}));

import { getDb } from '../db/index.js';
import { createLLMProvider } from '../services/llm/index.js';

const mockGetDb = vi.mocked(getDb);
const mockCreateLLMProvider = vi.mocked(createLLMProvider);

function createTestApp() {
  const app = new Hono<Env>();
  app.use('*', async (c, next) => {
    c.set('user', {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: null,
    });
    await next();
  });
  app.route('/chat', chatRoutes);
  return app;
}

describe('chatRoutes', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    };

    (mockDb.select as any).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    }));

    (mockDb.insert as any).mockImplementation(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    }));

    (mockDb.update as any).mockImplementation(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }));

    mockGetDb.mockResolvedValue(mockDb as any);
  });

  describe('POST /chat', () => {
    it('should return 404 when conversation not found', async () => {
      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should return 404 when conversation belongs to different user', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: '00000000-0000-0000-0000-000000000000', userId: 'other-user-id' },
            ]),
          }),
        }),
      }));

      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(404);
    });

    it('should validate conversationId is UUID', async () => {
      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'not-a-uuid',
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should validate message is not empty', async () => {
      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: '',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should validate message length', async () => {
      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'a'.repeat(10001),
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should stream SSE response for valid request', async () => {
      const mockConversation = { id: '00000000-0000-0000-0000-000000000000', userId: 'test-user-id' };
      const mockMessages = [
        { id: 'm1', role: 'user', content: 'Previous message', createdAt: new Date() },
      ];

      let selectCallCount = 0;
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
            orderBy: vi.fn().mockResolvedValue(selectCallCount++ === 0 ? [] : mockMessages),
          }),
          orderBy: vi.fn().mockResolvedValue(mockMessages),
        }),
      }));

      // Mock LLM provider with async generator
      async function* mockChat() {
        yield 'Hello';
        yield ' World';
      }
      mockCreateLLMProvider.mockReturnValue({
        chat: mockChat,
      });

      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/event-stream');

      const text = await res.text();
      expect(text).toContain('data:');
      expect(text).toContain('"type":"start"');
    });

    it('should handle LLM error', async () => {
      const mockConversation = { id: '00000000-0000-0000-0000-000000000000', userId: 'test-user-id' };

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
            orderBy: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }));

      // Mock LLM provider that throws error
      async function* mockChatError(): AsyncGenerator<string> {
        throw new Error('LLM API Error');
      }
      mockCreateLLMProvider.mockReturnValue({
        chat: mockChatError,
      });

      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('"type":"error"');
      // Error message should be sanitized (not expose internal error details)
      expect(text).toContain('An error occurred while generating a response');
    });

    it('should use specified model', async () => {
      const mockConversation = { id: '00000000-0000-0000-0000-000000000000', userId: 'test-user-id' };

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
            orderBy: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }));

      async function* mockChat() {
        yield 'Response';
      }
      mockCreateLLMProvider.mockReturnValue({
        chat: mockChat,
      });

      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
          model: 'openai',
        }),
      });

      // Consume the stream to trigger the SSE handler
      await res.text();

      expect(mockCreateLLMProvider).toHaveBeenCalledWith('openai');
    });

    it('should pass system prompt to LLM', async () => {
      const mockConversation = { id: '00000000-0000-0000-0000-000000000000', userId: 'test-user-id' };

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
            orderBy: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }));

      const mockChat = vi.fn().mockImplementation(async function* () {
        yield 'Response';
      });
      mockCreateLLMProvider.mockReturnValue({
        chat: mockChat,
      });

      const app = createTestApp();

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: '00000000-0000-0000-0000-000000000000',
          message: 'Hello',
          systemPrompt: 'You are helpful',
        }),
      });

      // Consume the stream to trigger the SSE handler
      await res.text();

      expect(mockChat).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ systemPrompt: 'You are helpful' })
      );
    });
  });
});
