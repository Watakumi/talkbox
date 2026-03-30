# TalkBox

[English](#english) | [日本語](#japanese)

---

<a id="english"></a>

## English

An open-source chat UI for Large Language Models. Simple like Streamlit, powerful like ChatGPT.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

### Features

- **Multi-language Support** - Japanese and English with easy language switching
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- **Modern Stack** - React 18, TypeScript, Tailwind CSS, Hono
- **Multiple LLM Providers** - Support for Gemini (more coming soon)
- **Conversation History** - Persistent chat history with MySQL/MariaDB

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Hono (TypeScript) |
| Database | MySQL (Drizzle ORM) |
| State | Zustand |
| Styling | Tailwind CSS + Headless UI |
| Monorepo | pnpm + Turborepo |

### Getting Started

#### Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (or Docker)

#### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/talkbox.git
cd talkbox

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys
```

#### Development

```bash
# Start MySQL with Docker
cd docker && docker compose up -d db

# Start development servers
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

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
└── docs/             # Documentation
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<a id="japanese"></a>

## 日本語

OSSのLLMチャットUI。Streamlitのような手軽さで、ChatGPTライクな体験を提供します。

### 特徴

- **多言語対応** - 日本語・英語切替
- **レスポンシブデザイン** - デスクトップ・モバイル対応
- **アクセシブル** - キーボード操作・スクリーンリーダー対応
- **モダンスタック** - React 18, TypeScript, Tailwind CSS, Hono
- **複数LLMプロバイダー** - Gemini対応（他も追加予定）
- **会話履歴** - MySQL/MariaDBで永続化

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript + Vite |
| バックエンド | Hono (TypeScript) |
| データベース | MySQL (Drizzle ORM) |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS + Headless UI |
| モノレポ | pnpm + Turborepo |

### セットアップ

#### 必要条件

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (またはDocker)

#### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/talkbox.git
cd talkbox

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .env を編集してAPIキーを設定
```

#### 開発サーバーの起動

```bash
# MySQLをDockerで起動
cd docker && docker compose up -d db

# 開発サーバーを起動
pnpm dev
```

- フロントエンド: http://localhost:5173
- API: http://localhost:3001

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
└── docs/             # ドキュメント
```

### コントリビュート

Pull Requestを歓迎します！

---

## License / ライセンス

MIT License - see [LICENSE](LICENSE) for details.
