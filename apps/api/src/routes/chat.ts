import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, conversations, messages } from '../db/index.js';
import { createLLMProvider } from '../services/llm/index.js';
import type { Env } from '../types/env.js';
import type { ChatEvent } from '@talkbox/shared';

const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
});

export const chatRoutes = new Hono<Env>().post(
  '/',
  zValidator('json', chatSchema),
  async (c) => {
    const user = c.get('user');
    const { conversationId, message } = c.req.valid('json');
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

    return streamSSE(c, async (stream) => {
      const assistantMessageId = crypto.randomUUID();

      const startEvent: ChatEvent = { type: 'start', messageId: assistantMessageId };
      await stream.writeSSE({ data: JSON.stringify(startEvent) });

      const llm = createLLMProvider('gemini');
      let fullContent = '';

      try {
        for await (const chunk of llm.chat(llmMessages)) {
          fullContent += chunk;
          const chunkEvent: ChatEvent = { type: 'chunk', content: chunk };
          await stream.writeSSE({ data: JSON.stringify(chunkEvent) });
        }

        // アシスタントメッセージを保存
        await db.insert(messages).values({
          id: assistantMessageId,
          conversationId,
          role: 'assistant',
          content: fullContent,
        });

        // 会話のupdatedAtを更新
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));

        const doneEvent: ChatEvent = { type: 'done' };
        await stream.writeSSE({ data: JSON.stringify(doneEvent) });
      } catch (error) {
        const errorEvent: ChatEvent = {
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        await stream.writeSSE({ data: JSON.stringify(errorEvent) });
      }
    });
  }
);
