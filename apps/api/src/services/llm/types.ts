import type { MessageRole } from '@talkbox/shared';

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMChatOptions {
  systemPrompt?: string;
}

export interface LLMProvider {
  chat(messages: LLMMessage[], options?: LLMChatOptions): AsyncGenerator<string, void, unknown>;
}
