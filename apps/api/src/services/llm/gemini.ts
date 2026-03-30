import { GoogleGenAI } from '@google/genai';
import type { LLMMessage, LLMProvider, LLMChatOptions } from './types.js';

export function createGeminiProvider(apiKey: string): LLMProvider {
  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  return {
    async *chat(messages: LLMMessage[], options?: LLMChatOptions): AsyncGenerator<string, void, unknown> {
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        throw new Error('No messages provided');
      }

      const chat = ai.chats.create({
        model: modelName,
        history,
        config: options?.systemPrompt
          ? { systemInstruction: options.systemPrompt }
          : undefined,
      });

      const stream = await chat.sendMessageStream({
        message: lastMessage.content,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    },
  };
}
