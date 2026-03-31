import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, conversations, messages } from '../db/index.js';
import { createLLMProvider } from '../services/llm/index.js';
import { getMCPManager } from './mcp.js';
import type { Env } from '../types/env.js';
import type { ChatEvent } from '@talkbox/shared';
import type { LLMTool, LLMToolResult, LLMToolCall } from '../services/llm/types.js';

const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  systemPrompt: z.string().max(5000).optional(),
  model: z.enum(['gemini', 'openai', 'anthropic']).optional(),
  useMcpTools: z.boolean().optional(),
});

const MAX_TOOL_ITERATIONS = 10;

export const chatRoutes = new Hono<Env>().post(
  '/',
  zValidator('json', chatSchema),
  async (c) => {
    const user = c.get('user');
    const { conversationId, message, systemPrompt, model, useMcpTools } =
      c.req.valid('json');
    const db = await getDb();

    // 会話の所有者確認
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== user.id) {
      return c.json({ error: 'Conversation not found', code: 'NOT_FOUND' }, 404);
    }

    // ユーザーメッセージを保存
    const userMessageId = crypto.randomUUID();
    await db.insert(messages).values({
      id: userMessageId,
      conversationId,
      role: 'user',
      content: message,
    });

    // 過去のメッセージを取得
    const messageHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const llmMessages = messageHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // MCPツールを取得
    const mcpManager = getMCPManager();
    const mcpTools = useMcpTools ? mcpManager.getAllTools() : [];
    const tools: LLMTool[] = mcpTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as LLMTool['inputSchema'],
    }));

    return streamSSE(c, async (stream) => {
      const assistantMessageId = crypto.randomUUID();

      const startEvent: ChatEvent = { type: 'start', messageId: assistantMessageId };
      await stream.writeSSE({ data: JSON.stringify(startEvent) });

      const llm = createLLMProvider(model || 'gemini');
      let fullContent = '';
      let toolResults: LLMToolResult[] = [];
      let iterations = 0;

      try {
        while (iterations < MAX_TOOL_ITERATIONS) {
          iterations++;
          const pendingToolCalls: LLMToolCall[] = [];
          let stopReason: 'end_turn' | 'tool_use' = 'end_turn';

          for await (const event of llm.chat(llmMessages, {
            systemPrompt,
            tools: tools.length > 0 ? tools : undefined,
            toolResults: toolResults.length > 0 ? toolResults : undefined,
          })) {
            if (event.type === 'text') {
              fullContent += event.content;
              const chunkEvent: ChatEvent = { type: 'chunk', content: event.content };
              await stream.writeSSE({ data: JSON.stringify(chunkEvent) });
            }

            if (event.type === 'tool_call') {
              pendingToolCalls.push(event.toolCall);
              const toolCallEvent: ChatEvent = {
                type: 'tool_call',
                toolName: event.toolCall.name,
                toolCallId: event.toolCall.id,
                arguments: event.toolCall.arguments,
              };
              await stream.writeSSE({ data: JSON.stringify(toolCallEvent) });
            }

            if (event.type === 'done') {
              stopReason = event.stopReason;
            }
          }

          // ツール呼び出しがなければ終了
          if (stopReason === 'end_turn' || pendingToolCalls.length === 0) {
            break;
          }

          // ツールを実行
          toolResults = [];
          for (const tc of pendingToolCalls) {
            try {
              const result = await mcpManager.callTool(tc.name, tc.arguments);
              const resultText =
                result.content
                  ?.map((c) => ('text' in c ? c.text : JSON.stringify(c)))
                  .join('\n') || '';

              toolResults.push({
                toolCallId: tc.id,
                content: resultText,
                isError: result.isError,
              });

              const toolResultEvent: ChatEvent = {
                type: 'tool_result',
                toolCallId: tc.id,
                result: resultText,
                isError: result.isError,
              };
              await stream.writeSSE({ data: JSON.stringify(toolResultEvent) });
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Tool execution failed';
              toolResults.push({
                toolCallId: tc.id,
                content: errorMessage,
                isError: true,
              });

              const toolResultEvent: ChatEvent = {
                type: 'tool_result',
                toolCallId: tc.id,
                result: errorMessage,
                isError: true,
              };
              await stream.writeSSE({ data: JSON.stringify(toolResultEvent) });
            }
          }
        }

        // アシスタントメッセージを保存
        if (fullContent) {
          await db.insert(messages).values({
            id: assistantMessageId,
            conversationId,
            role: 'assistant',
            content: fullContent,
          });
        }

        // 会話のupdatedAtを更新
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));

        const doneEvent: ChatEvent = { type: 'done' };
        await stream.writeSSE({ data: JSON.stringify(doneEvent) });
      } catch (error) {
        console.error('LLM stream error:', error);

        const errorEvent: ChatEvent = {
          type: 'error',
          message: 'An error occurred while generating a response. Please try again.',
        };
        await stream.writeSSE({ data: JSON.stringify(errorEvent) });
      }
    });
  }
);
