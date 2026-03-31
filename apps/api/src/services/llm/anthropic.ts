import Anthropic from '@anthropic-ai/sdk';
import type {
  LLMMessage,
  LLMProvider,
  LLMChatOptions,
  LLMStreamEvent,
  LLMTool,
  LLMToolResult,
} from './types.js';

function convertTools(tools: LLMTool[]): Anthropic.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description || '',
    input_schema: {
      type: 'object' as const,
      properties: tool.inputSchema.properties || {},
      required: tool.inputSchema.required,
    },
  }));
}

function buildMessages(
  messages: LLMMessage[],
  toolResults?: LLMToolResult[]
): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  if (toolResults && toolResults.length > 0) {
    result.push({
      role: 'user',
      content: toolResults.map((tr) => ({
        type: 'tool_result' as const,
        tool_use_id: tr.toolCallId,
        content: tr.content,
        is_error: tr.isError,
      })),
    });
  }

  return result;
}

export function createAnthropicProvider(apiKey: string): LLMProvider {
  const anthropic = new Anthropic({ apiKey });
  const modelName = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  return {
    async *chat(
      messages: LLMMessage[],
      options?: LLMChatOptions
    ): AsyncGenerator<LLMStreamEvent, void, unknown> {
      const anthropicMessages = buildMessages(messages, options?.toolResults);
      const tools = options?.tools ? convertTools(options.tools) : undefined;

      const stream = anthropic.messages.stream({
        model: modelName,
        max_tokens: 4096,
        system: options?.systemPrompt,
        messages: anthropicMessages,
        tools,
      });

      let currentToolCall: {
        id: string;
        name: string;
        inputJson: string;
      } | null = null;

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield { type: 'text', content: event.delta.text };
        }

        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolCall = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: '',
            };
          }
        }

        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'input_json_delta'
        ) {
          if (currentToolCall) {
            currentToolCall.inputJson += event.delta.partial_json;
          }
        }

        if (event.type === 'content_block_stop') {
          if (currentToolCall) {
            const args = currentToolCall.inputJson
              ? JSON.parse(currentToolCall.inputJson)
              : {};
            yield {
              type: 'tool_call',
              toolCall: {
                id: currentToolCall.id,
                name: currentToolCall.name,
                arguments: args,
              },
            };
            currentToolCall = null;
          }
        }

        if (event.type === 'message_stop') {
          const finalMessage = await stream.finalMessage();
          yield {
            type: 'done',
            stopReason:
              finalMessage.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
          };
        }
      }
    },
  };
}
