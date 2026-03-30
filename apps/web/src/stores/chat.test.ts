import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from './chat';
import type { Message, ConversationWithMessages } from '@talkbox/shared';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    conversations: {
      get: vi.fn(),
    },
    chat: {
      send: vi.fn(),
    },
  },
}));

// Mock settings store
vi.mock('./settings', () => ({
  useSettingsStore: {
    getState: () => ({
      systemPrompt: '',
      model: 'gemini',
    }),
  },
}));

import { api } from '@/services/api';

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi there!',
    createdAt: '2024-01-01T00:00:01.000Z',
  },
];

describe('chat store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      isStreaming: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty messages', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
    });

    it('should not be streaming', () => {
      const state = useChatStore.getState();
      expect(state.isStreaming).toBe(false);
    });

    it('should have no error', () => {
      const state = useChatStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('loadMessages', () => {
    it('should load messages from conversation', async () => {
      const mockConversation: ConversationWithMessages = {
        id: 'conv-1',
        userId: 'user-1',
        title: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        messages: mockMessages,
      };
      vi.mocked(api.conversations.get).mockResolvedValue(mockConversation);

      await useChatStore.getState().loadMessages('conv-1');

      const state = useChatStore.getState();
      expect(state.messages).toEqual(mockMessages);
      expect(state.error).toBeNull();
    });

    it('should handle load error', async () => {
      vi.mocked(api.conversations.get).mockRejectedValue(new Error('Not found'));

      await useChatStore.getState().loadMessages('conv-1');

      const state = useChatStore.getState();
      expect(state.error).toBe('Not found');
    });

    it('should handle non-Error rejection', async () => {
      vi.mocked(api.conversations.get).mockRejectedValue('Unknown');

      await useChatStore.getState().loadMessages('conv-1');

      expect(useChatStore.getState().error).toBe('Failed to load');
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      useChatStore.setState({ messages: mockMessages, error: 'some error' });

      useChatStore.getState().clearMessages();

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('stopStreaming', () => {
    it('should set isStreaming to false', () => {
      useChatStore.setState({ isStreaming: true });

      useChatStore.getState().stopStreaming();

      expect(useChatStore.getState().isStreaming).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should add user message immediately', async () => {
      // Mock the generator to return an empty stream
      async function* emptyStream() {
        yield { type: 'done' as const };
      }
      vi.mocked(api.chat.send).mockReturnValue(emptyStream());

      // Don't await to check immediate state
      const promise = useChatStore.getState().sendMessage('conv-1', 'Hello');

      // Check that user message was added
      const state = useChatStore.getState();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('Hello');
      expect(state.isStreaming).toBe(true);

      await promise;
    });

    it('should handle start event', async () => {
      async function* streamWithStart() {
        yield { type: 'start' as const, messageId: 'msg-123' };
        yield { type: 'done' as const };
      }
      vi.mocked(api.chat.send).mockReturnValue(streamWithStart());

      await useChatStore.getState().sendMessage('conv-1', 'Hello');

      const state = useChatStore.getState();
      expect(state.messages.length).toBe(2);
      expect(state.messages[1].id).toBe('msg-123');
      expect(state.messages[1].role).toBe('assistant');
    });

    it('should handle chunk events', async () => {
      async function* streamWithChunks() {
        yield { type: 'start' as const, messageId: 'msg-123' };
        yield { type: 'chunk' as const, content: 'Hello ' };
        yield { type: 'chunk' as const, content: 'World!' };
        yield { type: 'done' as const };
      }
      vi.mocked(api.chat.send).mockReturnValue(streamWithChunks());

      await useChatStore.getState().sendMessage('conv-1', 'Hi');

      const state = useChatStore.getState();
      expect(state.messages[1].content).toBe('Hello World!');
    });

    it('should handle error event', async () => {
      async function* streamWithError() {
        yield { type: 'start' as const, messageId: 'msg-123' };
        yield { type: 'error' as const, message: 'API Error' };
      }
      vi.mocked(api.chat.send).mockReturnValue(streamWithError());

      await useChatStore.getState().sendMessage('conv-1', 'Hi');

      const state = useChatStore.getState();
      expect(state.error).toBe('API Error');
      expect(state.isStreaming).toBe(false);
    });

    it('should handle AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      async function* throwAbort(): AsyncGenerator<never> {
        throw abortError;
      }
      vi.mocked(api.chat.send).mockReturnValue(throwAbort());

      await useChatStore.getState().sendMessage('conv-1', 'Hi');

      const state = useChatStore.getState();
      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeNull(); // AbortError should not set error
    });

    it('should handle other errors', async () => {
      async function* throwError(): AsyncGenerator<never> {
        throw new Error('Network error');
      }
      vi.mocked(api.chat.send).mockReturnValue(throwError());

      await useChatStore.getState().sendMessage('conv-1', 'Hi');

      const state = useChatStore.getState();
      expect(state.isStreaming).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
});
