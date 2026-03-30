import { create } from 'zustand';
import type { Message } from '@talkbox/shared';
import { api } from '@/services/api';

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;

  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,

  loadMessages: async (conversationId) => {
    try {
      const data = await api.conversations.get(conversationId);
      set({ messages: data.messages, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load' });
    }
  },

  sendMessage: async (conversationId, content) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    let assistantMessageId = '';
    let fullContent = '';

    try {
      for await (const event of api.chat.send(conversationId, content)) {
        switch (event.type) {
          case 'start':
            assistantMessageId = event.messageId;
            set((state) => ({
              messages: [
                ...state.messages,
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: '',
                  createdAt: new Date().toISOString(),
                },
              ],
            }));
            break;

          case 'chunk':
            fullContent += event.content;
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullContent }
                  : msg
              ),
            }));
            break;

          case 'done':
            set({ isStreaming: false });
            break;

          case 'error':
            set({ isStreaming: false, error: event.message });
            break;
        }
      }
    } catch (error) {
      set({
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Failed to send',
      });
    }
  },

  clearMessages: () => {
    set({ messages: [], error: null });
  },
}));
