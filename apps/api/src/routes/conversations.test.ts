import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { conversationsRoutes } from './conversations.js';
import type { Env } from '../types/env.js';

// Mock the database module
vi.mock('../db/index.js', () => ({
  getDb: vi.fn(),
  conversations: { id: 'id', title: 'title', userId: 'userId', updatedAt: 'updatedAt', createdAt: 'createdAt' },
  messages: { id: 'id', conversationId: 'conversationId', role: 'role', content: 'content', createdAt: 'createdAt' },
}));

import { getDb } from '../db/index.js';

const mockGetDb = vi.mocked(getDb);

function createTestApp() {
  const app = new Hono<Env>();
  // Add mock user middleware
  app.use('*', async (c, next) => {
    c.set('user', {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: null,
    });
    await next();
  });
  app.route('/conversations', conversationsRoutes);
  return app;
}

describe('conversationsRoutes', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDb = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    // Chain methods
    (mockDb.select as any).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          limit: vi.fn().mockResolvedValue([]),
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

    (mockDb.delete as any).mockImplementation(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    }));

    mockGetDb.mockResolvedValue(mockDb as any);
  });

  describe('GET /conversations', () => {
    it('should return empty list when no conversations', async () => {
      const app = createTestApp();

      const res = await app.request('/conversations');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        conversations: [],
        nextCursor: null,
      });
    });

    it('should return list of conversations', async () => {
      const mockConversations = [
        { id: '1', title: 'Test 1', updatedAt: new Date('2024-01-01') },
        { id: '2', title: 'Test 2', updatedAt: new Date('2024-01-02') },
      ];

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockConversations),
            }),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.conversations).toHaveLength(2);
      expect(body.conversations[0].id).toBe('1');
    });
  });

  describe('POST /conversations', () => {
    it('should create a new conversation with default title', async () => {
      const app = createTestApp();

      const res = await app.request('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.title).toBe('新しい会話');
      expect(body.id).toBeDefined();
    });

    it('should create a new conversation with custom title', async () => {
      const app = createTestApp();

      const res = await app.request('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Custom Title' }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.title).toBe('Custom Title');
    });

    it('should reject title longer than 200 characters', async () => {
      const app = createTestApp();

      const res = await app.request('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'a'.repeat(201) }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /conversations/:id', () => {
    it('should return 404 when conversation not found', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/non-existent-id');

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should return 404 when conversation belongs to different user', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: '1', userId: 'other-user-id', title: 'Test' },
            ]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/1');

      expect(res.status).toBe(404);
    });

    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: '1',
        userId: 'test-user-id',
        title: 'Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const mockMessages = [
        { id: 'm1', role: 'user', content: 'Hello', createdAt: new Date('2024-01-01') },
      ];

      let callCount = 0;
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
            orderBy: vi.fn().mockResolvedValue(callCount++ === 0 ? [mockConversation] : mockMessages),
          }),
          orderBy: vi.fn().mockResolvedValue(mockMessages),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/1');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe('1');
      expect(body.title).toBe('Test');
    });
  });

  describe('PATCH /conversations/:id', () => {
    it('should return 404 when conversation not found', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/non-existent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Title' }),
      });

      expect(res.status).toBe(404);
    });

    it('should update conversation title', async () => {
      const mockConversation = {
        id: '1',
        userId: 'test-user-id',
        title: 'Old Title',
      };

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Title' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe('New Title');
    });

    it('should reject empty title', async () => {
      const app = createTestApp();
      const res = await app.request('/conversations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /conversations/:id', () => {
    it('should return 404 when conversation not found', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/non-existent', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });

    it('should delete conversation', async () => {
      const mockConversation = {
        id: '1',
        userId: 'test-user-id',
        title: 'Test',
      };

      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConversation]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/1', {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting other users conversation', async () => {
      (mockDb.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: '1', userId: 'other-user-id', title: 'Test' },
            ]),
          }),
        }),
      }));

      const app = createTestApp();
      const res = await app.request('/conversations/1', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });
  });
});
