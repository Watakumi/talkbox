import type {
  Conversation,
  ConversationWithMessages,
  ConversationsResponse,
  ChatEvent,
  LLMProviderType,
} from '@talkbox/shared';

const API_BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  conversations: {
    list: () => request<ConversationsResponse>('/conversations'),

    get: (id: string) => request<ConversationWithMessages>(`/conversations/${id}`),

    create: (title?: string) =>
      request<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),

    update: (id: string, title: string) =>
      request<Conversation>(`/conversations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),

    delete: (id: string) =>
      fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' }),
  },

  chat: {
    send: async function* (
      conversationId: string,
      message: string,
      options?: { signal?: AbortSignal; systemPrompt?: string; model?: LLMProviderType }
    ): AsyncGenerator<ChatEvent, void, unknown> {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
          systemPrompt: options?.systemPrompt,
          model: options?.model,
        }),
        signal: options?.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data) {
                yield JSON.parse(data) as ChatEvent;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  },
};
