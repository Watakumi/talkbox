// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// Conversation
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// Message
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

// API Request/Response
export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title: string;
}

export type LLMProviderType = 'gemini' | 'openai' | 'anthropic';

export interface ChatRequest {
  conversationId: string;
  message: string;
  systemPrompt?: string;
  model?: LLMProviderType;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  nextCursor: string | null;
}

// SSE Events
export type ChatEventType = 'start' | 'chunk' | 'tool_call' | 'tool_result' | 'done' | 'error';

export interface ChatStartEvent {
  type: 'start';
  messageId: string;
}

export interface ChatChunkEvent {
  type: 'chunk';
  content: string;
}

export interface ChatToolCallEvent {
  type: 'tool_call';
  toolName: string;
  toolCallId: string;
  arguments: Record<string, unknown>;
}

export interface ChatToolResultEvent {
  type: 'tool_result';
  toolCallId: string;
  result: string;
  isError?: boolean;
}

export interface ChatDoneEvent {
  type: 'done';
}

export interface ChatErrorEvent {
  type: 'error';
  message: string;
}

export type ChatEvent =
  | ChatStartEvent
  | ChatChunkEvent
  | ChatToolCallEvent
  | ChatToolResultEvent
  | ChatDoneEvent
  | ChatErrorEvent;

// API Error
export interface ApiError {
  error: string;
  code?: string;
}
