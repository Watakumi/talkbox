# TalkBox API設計

## 概要

- ベースURL: `/api/v1`
- 認証: Bearer Token (JWT)
- レスポンス形式: JSON
- ストリーミング: Server-Sent Events (SSE)

## エンドポイント一覧

### 認証 (Auth)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/auth/google` | Google OAuth開始 |
| GET | `/auth/google/callback` | Google OAuthコールバック |
| GET | `/auth/github` | GitHub OAuth開始 |
| GET | `/auth/github/callback` | GitHub OAuthコールバック |
| POST | `/auth/logout` | ログアウト |
| GET | `/auth/me` | 現在のユーザー情報取得 |

### 会話 (Conversations)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/conversations` | 会話一覧取得 |
| POST | `/conversations` | 新規会話作成 |
| GET | `/conversations/:id` | 会話詳細取得 |
| PATCH | `/conversations/:id` | 会話タイトル更新 |
| DELETE | `/conversations/:id` | 会話削除 |

### チャット (Chat)

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/chat` | メッセージ送信 (SSEストリーミング) |

---

## エンドポイント詳細

### GET /auth/me

現在ログイン中のユーザー情報を取得。

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://..."
}
```

**Response 401:**
```json
{
  "error": "Unauthorized"
}
```

---

### GET /conversations

ユーザーの会話一覧を取得（更新日時の降順）。

**Query Parameters:**
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| limit | number | 20 | 取得件数 |
| cursor | string | - | ページネーションカーソル |

**Response 200:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "会話タイトル",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "nextCursor": "cursor-string"
}
```

---

### POST /conversations

新規会話を作成。

**Request Body:**
```json
{
  "title": "新しい会話"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "title": "新しい会話",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### GET /conversations/:id

会話の詳細とメッセージ履歴を取得。

**Response 200:**
```json
{
  "id": "uuid",
  "title": "会話タイトル",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "こんにちは",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "こんにちは！何かお手伝いできることはありますか？",
      "createdAt": "2024-01-01T00:00:01Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:01Z"
}
```

---

### PATCH /conversations/:id

会話タイトルを更新。

**Request Body:**
```json
{
  "title": "更新後のタイトル"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "title": "更新後のタイトル",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### DELETE /conversations/:id

会話を削除（メッセージもカスケード削除）。

**Response 204:** No Content

---

### POST /chat

メッセージを送信し、LLMからのストリーミングレスポンスを受信。

**Request Body:**
```json
{
  "conversationId": "uuid",
  "message": "TypeScriptの特徴を教えてください"
}
```

**Response (SSE Stream):**
```
Content-Type: text/event-stream

data: {"type":"start","messageId":"uuid"}

data: {"type":"chunk","content":"Type"}

data: {"type":"chunk","content":"Script"}

data: {"type":"chunk","content":"は"}

...

data: {"type":"done"}
```

---

## Hono ルート実装例

```typescript
// apps/api/src/routes/chat.ts
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
});

export const chatRoutes = new Hono()
  .post('/', zValidator('json', chatSchema), async (c) => {
    const { conversationId, message } = c.req.valid('json');
    const user = c.get('user');

    return streamSSE(c, async (stream) => {
      const messageId = crypto.randomUUID();

      await stream.writeSSE({ data: JSON.stringify({ type: 'start', messageId }) });

      const llm = createProvider(process.env.LLM_PROVIDER);
      let fullContent = '';

      for await (const chunk of llm.chat(messages)) {
        fullContent += chunk;
        await stream.writeSSE({ data: JSON.stringify({ type: 'chunk', content: chunk }) });
      }

      // メッセージをDBに保存
      await db.messages.create({ conversationId, role: 'assistant', content: fullContent });

      await stream.writeSSE({ data: JSON.stringify({ type: 'done' }) });
    });
  });
```

---

## エラーレスポンス

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | 権限エラー |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | バリデーションエラー |
| INTERNAL_ERROR | 500 | サーバーエラー |
