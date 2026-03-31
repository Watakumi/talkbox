import type { MessageRole } from '@talkbox/shared';

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export type LLMStreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; toolCall: LLMToolCall }
  | { type: 'done'; stopReason: 'end_turn' | 'tool_use' };

export interface LLMChatOptions {
  systemPrompt?: string;
  tools?: LLMTool[];
  toolResults?: LLMToolResult[];
}

export interface LLMProvider {
  chat(
    messages: LLMMessage[],
    options?: LLMChatOptions
  ): AsyncGenerator<LLMStreamEvent, void, unknown>;
}
