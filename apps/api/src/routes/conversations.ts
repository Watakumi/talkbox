import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { getDb, conversations, messages } from '../db/index.js';
import type { Env } from '../types/env.js';

const createSchema = z.object({
  title: z.string().min(1).max(200).optional().default('新しい会話'),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200),
});

export const conversationsRoutes = new Hono<Env>()
  // 会話一覧取得
  .get('/', async (c) => {
    const user = c.get('user');
    const db = await getDb();
    const result = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt))
      .limit(50);

    return c.json({
      conversations: result.map((conv) => ({
        ...conv,
        updatedAt: conv.updatedAt.toISOString(),
      })),
      nextCursor: null,
    });
  })

  // 新規会話作成
  .post('/', zValidator('json', createSchema), async (c) => {
    const user = c.get('user');
    const { title } = c.req.valid('json');
    const id = crypto.randomUUID();
    const now = new Date();
    const db = await getDb();

    await db.insert(conversations).values({
      id,
      userId: user.id,
      title,
      createdAt: now,
      updatedAt: now,
    });

    return c.json(
      {
        id,
        title,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      201
    );
  })

  // 会話詳細取得
  .get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const db = await getDb();

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation || conversation.userId !== user.id) {
      return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
    }

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    return c.json({
      id: conversation.id,
      title: conversation.title,
      messages: messageList.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    });
  })

  // 会話タイトル更新
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { title } = c.req.valid('json');
    const db = await getDb();

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation || conversation.userId !== user.id) {
      return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
    }

    const now = new Date();
    await db
      .update(conversations)
      .set({ title, updatedAt: now })
      .where(eq(conversations.id, id));

    return c.json({
      id,
      title,
      updatedAt: now.toISOString(),
    });
  })

  // 会話削除
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const db = await getDb();

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation || conversation.userId !== user.id) {
      return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
    }

    await db.delete(conversations).where(eq(conversations.id, id));

    return c.body(null, 204);
  });
