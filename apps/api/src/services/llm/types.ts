import type { MessageRole } from '@talkbox/shared';

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMProvider {
  chat(messages: LLMMessage[]): AsyncGenerator<string, void, unknown>;
}
