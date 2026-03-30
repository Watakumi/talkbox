import { create } from 'zustand';
import type { Conversation } from '@talkbox/shared';
import { api } from '@/services/api';

interface ConversationsState {
  conversations: Conversation[];
  currentId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  selectConversation: (id: string | null) => void;
  createConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  currentId: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.conversations.list();
      set({ conversations: data.conversations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch',
        isLoading: false,
      });
    }
  },

  selectConversation: (id) => {
    set({ currentId: id });
  },

  createConversation: async () => {
    const conversation = await api.conversations.create();
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentId: conversation.id,
    }));
    return conversation.id;
  },

  deleteConversation: async (id) => {
    await api.conversations.delete(id);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentId: state.currentId === id ? null : state.currentId,
    }));
  },
}));
