# TalkBox アーキテクチャ設計

## ディレクトリ構成

```
talkbox/
├── apps/
│   ├── web/                    # React フロントエンド
│   │   ├── src/
│   │   │   ├── components/     # UIコンポーネント
│   │   │   │   ├── chat/       # チャット関連
│   │   │   │   ├── sidebar/    # サイドバー
│   │   │   │   └── common/     # 共通コンポーネント
│   │   │   ├── hooks/          # カスタムフック
│   │   │   ├── stores/         # 状態管理
│   │   │   ├── services/       # API通信
│   │   │   ├── types/          # 型定義
│   │   │   └── utils/          # ユーティリティ
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                    # Hono バックエンド
│       ├── src/
│       │   ├── routes/         # APIルート
│       │   │   ├── auth.ts
│       │   │   ├── chat.ts
│       │   │   └── conversations.ts
│       │   ├── services/       # ビジネスロジック
│       │   │   ├── llm/        # LLMプロバイダー
│       │   │   │   ├── index.ts
│       │   │   │   ├── gemini.ts
│       │   │   │   └── types.ts
│       │   │   └── conversation.ts
│       │   ├── db/             # データベース層
│       │   │   ├── index.ts    # 抽象化層
│       │   │   ├── schema.ts   # スキーマ定義
│       │   │   └── adapters/   # DB アダプター
│       │   │       ├── mysql.ts
│       │   │       └── sqlite.ts
│       │   ├── middleware/     # ミドルウェア
│       │   │   ├── auth.ts
│       │   │   └── cors.ts
│       │   ├── types/          # 型定義
│       │   └── utils/          # ユーティリティ
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                 # 共有コード
│       ├── src/
│       │   └── types/          # フロント・バック共通型
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── docs/
│   ├── REQUIREMENTS.md
│   └── ARCHITECTURE.md
│
├── .env.example
├── package.json                # ルートpackage.json (workspaces)
├── pnpm-workspace.yaml
└── turbo.json
```

## モジュール設計

### フロントエンド (apps/web)

| モジュール | 責務 |
|-----------|------|
| `components/chat/` | チャット入力、メッセージ表示、ストリーミング表示 |
| `components/sidebar/` | 会話履歴一覧、新規会話作成 |
| `hooks/useChat` | チャット送信・ストリーミング受信ロジック |
| `hooks/useConversations` | 会話履歴の取得・管理 |
| `stores/` | Zustand または Jotai で状態管理 |
| `services/api` | バックエンドAPI通信 |

### バックエンド (apps/api)

| モジュール | 責務 |
|-----------|------|
| `routes/auth` | OAuth認証 (Google, GitHub) |
| `routes/chat` | チャット送信、ストリーミングレスポンス |
| `routes/conversations` | 会話履歴CRUD |
| `services/llm/` | LLMプロバイダー抽象化 |
| `db/` | データベース抽象化層 |
| `middleware/auth` | 認証ミドルウェア |

### LLM プロバイダー設計

```typescript
// services/llm/types.ts
interface LLMProvider {
  chat(messages: Message[]): AsyncGenerator<string>;
}

// services/llm/index.ts
function createProvider(type: 'gemini' | 'openai' | 'claude'): LLMProvider;
```

### DB 抽象化層設計

```typescript
// db/index.ts
interface DatabaseAdapter {
  conversations: {
    findByUserId(userId: string): Promise<Conversation[]>;
    create(data: CreateConversation): Promise<Conversation>;
    delete(id: string): Promise<void>;
  };
  messages: {
    findByConversationId(conversationId: string): Promise<Message[]>;
    create(data: CreateMessage): Promise<Message>;
  };
}
```

## 技術選定詳細

| カテゴリ | 技術 | 理由 |
|---------|------|------|
| パッケージマネージャ | pnpm | 高速、ディスク効率 |
| モノレポ | Turborepo | ビルドキャッシュ、並列実行 |
| ビルド (web) | Vite | 高速HMR、React対応 |
| ビルド (api) | tsup | シンプル、高速 |
| 状態管理 | Zustand | 軽量、シンプル |
| スタイリング | Tailwind CSS | ユーティリティファースト |
| ORM | Drizzle | 型安全、軽量 |
| バリデーション | Zod | 型推論、Honoと相性良 |

## 次のステップ

1. ✅ アーキテクチャ設計
2. ⏳ データベース設計 - テーブル定義
3. ⏳ API設計 - エンドポイント一覧
4. ⏳ UI設計 - コンポーネント構成
