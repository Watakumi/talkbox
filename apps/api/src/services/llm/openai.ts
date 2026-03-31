import OpenAI from 'openai';
import type {
  LLMMessage,
  LLMProvider,
  LLMChatOptions,
  LLMStreamEvent,
  LLMTool,
  LLMToolResult,
} from './types.js';

function convertTools(
  tools: LLMTool[]
): OpenAI.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: {
        type: 'object',
        properties: tool.inputSchema.properties || {},
        required: tool.inputSchema.required,
      },
    },
  }));
}

function buildMessages(
  messages: LLMMessage[],
  systemPrompt?: string,
  toolResults?: LLMToolResult[]
): OpenAI.ChatCompletionMessageParam[] {
  const result: OpenAI.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    result.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  if (toolResults && toolResults.length > 0) {
    for (const tr of toolResults) {
      result.push({
        role: 'tool',
        tool_call_id: tr.toolCallId,
        content: tr.content,
      });
    }
  }

  return result;
}

export function createOpenAIProvider(apiKey: string): LLMProvider {
  const openai = new OpenAI({ apiKey });
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  return {
    async *chat(
      messages: LLMMessage[],
      options?: LLMChatOptions
    ): AsyncGenerator<LLMStreamEvent, void, unknown> {
      const openaiMessages = buildMessages(
        messages,
        options?.systemPrompt,
        options?.toolResults
      );
      const tools = options?.tools ? convertTools(options.tools) : undefined;

      const stream = await openai.chat.completions.create({
        model: modelName,
        messages: openaiMessages,
        tools,
        stream: true,
      });

      const toolCalls: Map<
        number,
        { id: string; name: string; arguments: string }
      > = new Map();
      let hasToolCalls = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          yield { type: 'text', content: delta.content };
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const index = tc.index;
            if (!toolCalls.has(index)) {
              toolCalls.set(index, {
                id: tc.id || '',
                name: tc.function?.name || '',
                arguments: '',
              });
            }
            const existing = toolCalls.get(index)!;
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name = tc.function.name;
            if (tc.function?.arguments) {
              existing.arguments += tc.function.arguments;
            }
          }
        }

        if (chunk.choices[0]?.finish_reason) {
          hasToolCalls = chunk.choices[0].finish_reason === 'tool_calls';
        }
      }

      // Emit tool calls after stream completes
      for (const tc of toolCalls.values()) {
        if (tc.id && tc.name) {
          yield {
            type: 'tool_call',
            toolCall: {
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments ? JSON.parse(tc.arguments) : {},
            },
          };
        }
      }

      yield {
        type: 'done',
        stopReason: hasToolCalls ? 'tool_use' : 'end_turn',
      };
    },
  };
}
