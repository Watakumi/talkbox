import Anthropic from '@anthropic-ai/sdk';
import type { LLMMessage, LLMProvider, LLMChatOptions } from './types.js';

export function createAnthropicProvider(apiKey: string): LLMProvider {
  const anthropic = new Anthropic({ apiKey });
  const modelName = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  return {
    async *chat(messages: LLMMessage[], options?: LLMChatOptions): AsyncGenerator<string, void, unknown> {
      const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const stream = anthropic.messages.stream({
        model: modelName,
        max_tokens: 4096,
        system: options?.systemPrompt,
        messages: anthropicMessages,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
