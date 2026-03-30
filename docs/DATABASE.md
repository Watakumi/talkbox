# TalkBox データベース設計

## ER図

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │       │  conversations  │       │  messages   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)         │──┐    │ id (PK)     │
│ email       │  └───<│ user_id (FK)    │  └───<│ conv_id(FK) │
│ name        │       │ title           │       │ role        │
│ avatar_url  │       │ created_at      │       │ content     │
│ provider    │       │ updated_at      │       │ created_at  │
│ provider_id │       └─────────────────┘       └─────────────┘
│ created_at  │
│ updated_at  │
└─────────────┘
```

## テーブル定義

### users

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR(36) | PK | UUID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| name | VARCHAR(100) | NOT NULL | 表示名 |
| avatar_url | VARCHAR(500) | NULL | アバター画像URL |
| provider | VARCHAR(20) | NOT NULL | 認証プロバイダー (google, github) |
| provider_id | VARCHAR(255) | NOT NULL | プロバイダー側のユーザーID |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_users_email` (email)
- `idx_users_provider` (provider, provider_id)

### conversations

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK, NOT NULL | ユーザーID |
| title | VARCHAR(200) | NOT NULL | 会話タイトル |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_conversations_user_id` (user_id)
- `idx_conversations_updated_at` (user_id, updated_at DESC)

### messages

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR(36) | PK | UUID |
| conversation_id | VARCHAR(36) | FK, NOT NULL | 会話ID |
| role | ENUM('user', 'assistant') | NOT NULL | メッセージの役割 |
| content | TEXT | NOT NULL | メッセージ本文 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

**インデックス:**
- `idx_messages_conversation_id` (conversation_id, created_at ASC)

## Drizzle スキーマ

```typescript
// apps/api/src/db/schema.ts
import { mysqlTable, varchar, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const conversations = mysqlTable('conversations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const messages = mysqlTable('messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  conversationId: varchar('conversation_id', { length: 36 })
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: mysqlEnum('role', ['user', 'assistant']).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## マイグレーション

```sql
-- migrations/0001_create_users.sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  provider VARCHAR(20) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_provider (provider, provider_id)
);

-- migrations/0002_create_conversations.sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_conversations_user_id (user_id),
  INDEX idx_conversations_updated_at (user_id, updated_at DESC)
);

-- migrations/0003_create_messages.sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation_id (conversation_id, created_at ASC)
);
```
