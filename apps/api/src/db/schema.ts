import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    provider: varchar('provider', { length: 20 }).notNull(),
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_provider').on(table.provider, table.providerId),
  ]
);

export const conversations = mysqlTable(
  'conversations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    title: varchar('title', { length: 200 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index('idx_conversations_user_id').on(table.userId),
    index('idx_conversations_updated_at').on(table.userId, table.updatedAt),
  ]
);

export const messages = mysqlTable(
  'messages',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    conversationId: varchar('conversation_id', { length: 36 })
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: mysqlEnum('role', ['user', 'assistant']).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_messages_conversation_id').on(table.conversationId, table.createdAt),
  ]
);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
