import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

describe('api', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('conversations', () => {
    describe('list', () => {
      it('should fetch conversations list', async () => {
        const mockResponse = {
          conversations: [
            { id: '1', title: 'Test', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          ],
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.conversations.list();

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations', {
          headers: { 'Content-Type': 'application/json' },
        });
        expect(result).toEqual(mockResponse);
      });

      it('should throw error on failed request', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        });

        await expect(api.conversations.list()).rejects.toThrow('Unauthorized');
      });

      it('should throw default error when response has no error message', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.reject(new Error('Parse error')),
        });

        await expect(api.conversations.list()).rejects.toThrow('Unknown error');
      });
    });

    describe('get', () => {
      it('should fetch single conversation with messages', async () => {
        const mockResponse = {
          id: '1',
          title: 'Test',
          userId: 'user-1',
          messages: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.conversations.get('1');

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations/1', {
          headers: { 'Content-Type': 'application/json' },
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('create', () => {
      it('should create a new conversation', async () => {
        const mockResponse = {
          id: '1',
          title: 'New Chat',
          userId: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.conversations.create('New Chat');

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' }),
        });
        expect(result).toEqual(mockResponse);
      });

      it('should create conversation without title', async () => {
        const mockResponse = {
          id: '1',
          title: 'Untitled',
          userId: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        await api.conversations.create();

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: undefined }),
        });
      });
    });

    describe('update', () => {
      it('should update conversation title', async () => {
        const mockResponse = {
          id: '1',
          title: 'Updated Title',
          userId: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await api.conversations.update('1', 'Updated Title');

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations/1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' }),
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('should delete conversation', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await api.conversations.delete('1');

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/conversations/1', {
          method: 'DELETE',
        });
      });
    });
  });

  describe('chat', () => {
    describe('send', () => {
      function createMockReadableStream(chunks: string[]) {
        let index = 0;
        return {
          getReader: () => ({
            read: async () => {
              if (index < chunks.length) {
                const value = new TextEncoder().encode(chunks[index]);
                index++;
                return { done: false, value };
              }
              return { done: true, value: undefined };
            },
            releaseLock: vi.fn(),
          }),
        };
      }

      it('should send chat message and yield events', async () => {
        const mockEvents = [
          { type: 'start', messageId: '1' },
          { type: 'delta', content: 'Hello' },
          { type: 'done' },
        ];
        const sseData = mockEvents.map((e) => `data: ${JSON.stringify(e)}\n`).join('');

        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream([sseData]),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello')) {
          events.push(event);
        }

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: 'conv-1',
            message: 'Hello',
            systemPrompt: undefined,
            model: undefined,
          }),
          signal: undefined,
        });
        expect(events).toEqual(mockEvents);
      });

      it('should send with options', async () => {
        const controller = new AbortController();
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream(['data: {"type":"done"}\n']),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello', {
          signal: controller.signal,
          systemPrompt: 'You are helpful',
          model: 'openai',
        })) {
          events.push(event);
        }

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: 'conv-1',
            message: 'Hello',
            systemPrompt: 'You are helpful',
            model: 'openai',
          }),
          signal: controller.signal,
        });
      });

      it('should throw error on failed request', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          body: null,
        });

        const generator = api.chat.send('conv-1', 'Hello');
        await expect(generator.next()).rejects.toThrow('Chat request failed');
      });

      it('should throw error when body is null', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: null,
        });

        const generator = api.chat.send('conv-1', 'Hello');
        await expect(generator.next()).rejects.toThrow('Chat request failed');
      });

      it('should handle chunked SSE data', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream([
            'data: {"type":"start"}\n',
            'data: {"type":"delta","content":"Hi"}\n',
            'data: {"type":"done"}\n',
          ]),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello')) {
          events.push(event);
        }

        expect(events).toHaveLength(3);
        expect(events[0]).toEqual({ type: 'start' });
        expect(events[1]).toEqual({ type: 'delta', content: 'Hi' });
        expect(events[2]).toEqual({ type: 'done' });
      });

      it('should handle partial chunks', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream([
            'data: {"type":"sta',
            'rt"}\ndata: {"type":"done"}\n',
          ]),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello')) {
          events.push(event);
        }

        expect(events).toHaveLength(2);
        expect(events[0]).toEqual({ type: 'start' });
        expect(events[1]).toEqual({ type: 'done' });
      });

      it('should skip empty data lines', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream([
            'data: \ndata: {"type":"done"}\n',
          ]),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello')) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({ type: 'done' });
      });

      it('should skip non-data lines', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: createMockReadableStream([
            ':comment\nevent: message\ndata: {"type":"done"}\n',
          ]),
        });

        const events = [];
        for await (const event of api.chat.send('conv-1', 'Hello')) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
      });
    });
  });
});
