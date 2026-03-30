# TalkBox

[English](#english) | [日本語](#japanese)

---

<a id="english"></a>

## English

An open-source chat UI for Large Language Models. Simple like Streamlit, powerful like ChatGPT.

![CI](https://github.com/Watakumi/talkbox/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)

### Features

- **Multi-LLM Support** - Gemini, OpenAI (GPT-4o), and Anthropic (Claude) with easy switching
- **Multi-language Support** - Japanese and English with instant language switching
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- **Modern Stack** - React 18, TypeScript, Tailwind CSS, Hono
- **Conversation History** - Persistent chat history with MySQL/MariaDB
- **OAuth Authentication** - Google and GitHub OAuth support
- **Streaming Responses** - Real-time SSE streaming for smooth chat experience

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | New conversation |
| `Ctrl/Cmd + ,` | Open settings |
| `?` | Show keyboard shortcuts |
| `Escape` | Close modal |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Hono (TypeScript) |
| Database | MySQL (Drizzle ORM) |
| State | Zustand |
| Styling | Tailwind CSS + Headless UI |
| Testing | Vitest + Playwright (90%+ coverage) |
| Monorepo | pnpm + Turborepo |

### Getting Started

#### Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (or Docker)

#### Installation

```bash
# Clone the repository
git clone https://github.com/Watakumi/talkbox.git
cd talkbox

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys
```

#### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | At least one |
| `OPENAI_API_KEY` | OpenAI API key | At least one |
| `ANTHROPIC_API_KEY` | Anthropic API key | At least one |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For OAuth |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | For OAuth |
| `SESSION_SECRET` | Session encryption key (32+ chars) | Yes |

#### Development

```bash
# Start MySQL with Docker
cd docker && docker compose up -d db

# Start development servers
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

#### Running Tests

```bash
# Run all tests
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

#### Docker Compose (Full Stack)

```bash
cd docker
docker compose up -d
```

### Project Structure

```
talkbox/
├── apps/
│   ├── api/          # Hono backend
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared types
├── docker/           # Docker config
├── e2e/              # Playwright E2E tests
└── docs/             # Documentation
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<a id="japanese"></a>

## 日本語

OSSのLLMチャットUI。Streamlitのような手軽さで、ChatGPTライクな体験を提供します。

### 特徴

- **マルチLLM対応** - Gemini、OpenAI (GPT-4o)、Anthropic (Claude) を簡単に切替
- **多言語対応** - 日本語・英語を即座に切替可能
- **レスポンシブデザイン** - デスクトップ・モバイル対応
- **アクセシブル** - キーボード操作・スクリーンリーダー対応
- **モダンスタック** - React 18, TypeScript, Tailwind CSS, Hono
- **会話履歴** - MySQL/MariaDBで永続化
- **OAuth認証** - Google・GitHub OAuthに対応
- **ストリーミング** - SSEによるリアルタイムレスポンス

### キーボードショートカット

| ショートカット | アクション |
|----------------|------------|
| `Ctrl/Cmd + K` | 新規会話 |
| `Ctrl/Cmd + ,` | 設定を開く |
| `?` | ショートカット一覧 |
| `Escape` | モーダルを閉じる |

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript + Vite |
| バックエンド | Hono (TypeScript) |
| データベース | MySQL (Drizzle ORM) |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS + Headless UI |
| テスト | Vitest + Playwright (90%+カバレッジ) |
| モノレポ | pnpm + Turborepo |

### セットアップ

#### 必要条件

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (またはDocker)

#### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Watakumi/talkbox.git
cd talkbox

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .env を編集してAPIキーを設定
```

#### 環境変数

| 変数 | 説明 | 必須 |
|------|------|------|
| `DATABASE_URL` | MySQL接続文字列 | 必須 |
| `GEMINI_API_KEY` | Google Gemini APIキー | いずれか1つ |
| `OPENAI_API_KEY` | OpenAI APIキー | いずれか1つ |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | いずれか1つ |
| `GOOGLE_CLIENT_ID` | Google OAuthクライアントID | OAuth使用時 |
| `GOOGLE_CLIENT_SECRET` | Google OAuthクライアントシークレット | OAuth使用時 |
| `GITHUB_CLIENT_ID` | GitHub OAuthクライアントID | OAuth使用時 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuthクライアントシークレット | OAuth使用時 |
| `SESSION_SECRET` | セッション暗号化キー (32文字以上) | 必須 |

#### 開発サーバーの起動

```bash
# MySQLをDockerで起動
cd docker && docker compose up -d db

# 開発サーバーを起動
pnpm dev
```

- フロントエンド: http://localhost:5173
- API: http://localhost:3001

#### テストの実行

```bash
# 全テストを実行
pnpm test:run

# カバレッジ付きでテスト
pnpm test:coverage

# E2Eテストを実行
pnpm test:e2e
```

#### Docker Composeで全体を起動

```bash
cd docker
docker compose up -d
```

### プロジェクト構成

```
talkbox/
├── apps/
│   ├── api/          # Honoバックエンド
│   └── web/          # Reactフロントエンド
├── packages/
│   └── shared/       # 共有型定義
├── docker/           # Docker設定
├── e2e/              # Playwright E2Eテスト
└── docs/             # ドキュメント
```

### コントリビュート

Pull Requestを歓迎します！

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

---

## License / ライセンス

MIT License - see [LICENSE](LICENSE) for details.
