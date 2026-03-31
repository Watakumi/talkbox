import { GoogleGenAI, type FunctionDeclaration, type Part } from '@google/genai';
import type {
  LLMMessage,
  LLMProvider,
  LLMChatOptions,
  LLMStreamEvent,
  LLMTool,
  LLMToolResult,
} from './types.js';

function convertTools(tools: LLMTool[]): FunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description || '',
    parameters: {
      type: 'object',
      properties: tool.inputSchema.properties || {},
      required: tool.inputSchema.required || [],
    },
  }));
}

export function createGeminiProvider(apiKey: string): LLMProvider {
  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  return {
    async *chat(
      messages: LLMMessage[],
      options?: LLMChatOptions
    ): AsyncGenerator<LLMStreamEvent, void, unknown> {
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }] as Part[],
      }));

      // ツール結果がある場合、historyに追加
      if (options?.toolResults && options.toolResults.length > 0) {
        for (const tr of options.toolResults) {
          history.push({
            role: 'model',
            parts: [
              {
                functionCall: {
                  name: tr.toolCallId.split('_')[0] || 'unknown',
                  args: {},
                },
              },
            ] as Part[],
          });
          history.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: tr.toolCallId.split('_')[0] || 'unknown',
                  response: { result: tr.content },
                },
              },
            ] as Part[],
          });
        }
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        throw new Error('No messages provided');
      }

      const tools = options?.tools ? convertTools(options.tools) : undefined;

      const chat = ai.chats.create({
        model: modelName,
        history,
        config: {
          systemInstruction: options?.systemPrompt,
          tools: tools ? [{ functionDeclarations: tools }] : undefined,
        },
      });

      const stream = await chat.sendMessageStream({
        message: lastMessage.content,
      });

      let hasToolCalls = false;

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yield { type: 'text', content: text };
        }

        // Function callsをチェック
        const functionCalls = chunk.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
          hasToolCalls = true;
          for (const fc of functionCalls) {
            yield {
              type: 'tool_call',
              toolCall: {
                id: `${fc.name}_${Date.now()}`,
                name: fc.name || 'unknown',
                arguments: (fc.args as Record<string, unknown>) || {},
              },
            };
          }
        }
      }

      yield {
        type: 'done',
        stopReason: hasToolCalls ? 'tool_use' : 'end_turn',
      };
    },
  };
}
