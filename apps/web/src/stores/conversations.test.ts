import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConversationsStore } from './conversations';
import type { Conversation, ConversationsResponse } from '@talkbox/shared';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    conversations: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { api } from '@/services/api';

const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Test Conversation 1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Test Conversation 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('conversations store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useConversationsStore.setState({
      conversations: [],
      currentId: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty conversations', () => {
      const state = useConversationsStore.getState();
      expect(state.conversations).toEqual([]);
    });

    it('should have null currentId', () => {
      const state = useConversationsStore.getState();
      expect(state.currentId).toBeNull();
    });

    it('should not be loading', () => {
      const state = useConversationsStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error', () => {
      const state = useConversationsStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('fetchConversations', () => {
    it('should fetch and store conversations', async () => {
      const mockResponse: ConversationsResponse = { conversations: mockConversations };
      vi.mocked(api.conversations.list).mockResolvedValue(mockResponse);

      await useConversationsStore.getState().fetchConversations();

      const state = useConversationsStore.getState();
      expect(state.conversations).toEqual(mockConversations);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: ConversationsResponse) => void;
      const promise = new Promise<ConversationsResponse>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(api.conversations.list).mockReturnValue(promise);

      const fetchPromise = useConversationsStore.getState().fetchConversations();

      // Check loading state
      expect(useConversationsStore.getState().isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({ conversations: mockConversations });
      await fetchPromise;

      expect(useConversationsStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      vi.mocked(api.conversations.list).mockRejectedValue(new Error('Network error'));

      await useConversationsStore.getState().fetchConversations();

      const state = useConversationsStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error rejection', async () => {
      vi.mocked(api.conversations.list).mockRejectedValue('Unknown error');

      await useConversationsStore.getState().fetchConversations();

      const state = useConversationsStore.getState();
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('selectConversation', () => {
    it('should set currentId', () => {
      useConversationsStore.getState().selectConversation('123');

      expect(useConversationsStore.getState().currentId).toBe('123');
    });

    it('should set currentId to null', () => {
      useConversationsStore.setState({ currentId: '123' });

      useConversationsStore.getState().selectConversation(null);

      expect(useConversationsStore.getState().currentId).toBeNull();
    });
  });

  describe('createConversation', () => {
    it('should create and add new conversation', async () => {
      const newConversation: Conversation = {
        id: '3',
        userId: 'user-1',
        title: 'New Conversation',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      };
      vi.mocked(api.conversations.create).mockResolvedValue(newConversation);

      useConversationsStore.setState({ conversations: mockConversations });

      const id = await useConversationsStore.getState().createConversation();

      const state = useConversationsStore.getState();
      expect(id).toBe('3');
      expect(state.currentId).toBe('3');
      expect(state.conversations[0]).toEqual(newConversation);
      expect(state.conversations.length).toBe(3);
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation from state', async () => {
      vi.mocked(api.conversations.delete).mockResolvedValue(undefined);
      useConversationsStore.setState({ conversations: mockConversations });

      await useConversationsStore.getState().deleteConversation('1');

      const state = useConversationsStore.getState();
      expect(state.conversations.length).toBe(1);
      expect(state.conversations[0].id).toBe('2');
    });

    it('should clear currentId if deleted conversation was selected', async () => {
      vi.mocked(api.conversations.delete).mockResolvedValue(undefined);
      useConversationsStore.setState({
        conversations: mockConversations,
        currentId: '1',
      });

      await useConversationsStore.getState().deleteConversation('1');

      expect(useConversationsStore.getState().currentId).toBeNull();
    });

    it('should not clear currentId if different conversation was deleted', async () => {
      vi.mocked(api.conversations.delete).mockResolvedValue(undefined);
      useConversationsStore.setState({
        conversations: mockConversations,
        currentId: '2',
      });

      await useConversationsStore.getState().deleteConversation('1');

      expect(useConversationsStore.getState().currentId).toBe('2');
    });
  });
});
