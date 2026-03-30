import OpenAI from 'openai';
import type { LLMMessage, LLMProvider, LLMChatOptions } from './types.js';

export function createOpenAIProvider(apiKey: string): LLMProvider {
  const openai = new OpenAI({ apiKey });
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  return {
    async *chat(messages: LLMMessage[], options?: LLMChatOptions): AsyncGenerator<string, void, unknown> {
      const systemMessages: OpenAI.ChatCompletionMessageParam[] = options?.systemPrompt
        ? [{ role: 'system', content: options.systemPrompt }]
        : [];

      const userMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const stream = await openai.chat.completions.create({
        model: modelName,
        messages: [...systemMessages, ...userMessages],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    },
  };
}
