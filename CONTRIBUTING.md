# Contributing to TalkBox

[English](#english) | [日本語](#japanese)

---

<a id="english"></a>

## English

Thank you for your interest in contributing to TalkBox! This document provides guidelines and instructions for contributing.

### Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)

### Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Getting Started

#### Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (or Docker)
- Git

#### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/talkbox.git
cd talkbox

# Add upstream remote
git remote add upstream https://github.com/Watakumi/talkbox.git

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start MySQL with Docker
cd docker && docker compose up -d db && cd ..

# Run development server
pnpm dev
```

### Development Workflow

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation if needed

4. **Verify your changes**
   ```bash
   # Type check
   pnpm build

   # Lint
   pnpm lint

   # Run tests
   pnpm test:run

   # Run E2E tests (optional but recommended)
   pnpm test:e2e
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

### Pull Request Process

1. **Before submitting**
   - Ensure all tests pass
   - Ensure the build succeeds
   - Update documentation if needed
   - Add tests for new features

2. **PR Title**
   - Use conventional commit format: `type: description`
   - Examples:
     - `feat: add dark mode support`
     - `fix: resolve streaming issue on mobile`
     - `docs: update API documentation`

3. **PR Description**
   - Describe what changes you made
   - Explain why you made these changes
   - Include screenshots for UI changes
   - Reference related issues (e.g., `Fixes #123`)

4. **Review process**
   - A maintainer will review your PR
   - Address any requested changes
   - Once approved, a maintainer will merge your PR

### Coding Standards

#### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` if type is truly unknown

#### React

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types for props
- Follow accessibility best practices (WCAG)

#### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography

#### File Organization

```
src/
├── components/    # React components
│   ├── common/    # Shared components
│   └── feature/   # Feature-specific components
├── hooks/         # Custom React hooks
├── services/      # API and external services
├── stores/        # Zustand stores
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Testing

#### Unit Tests

- Use Vitest for unit testing
- Place test files next to source files: `*.test.ts` or `*.test.tsx`
- Aim for meaningful test coverage (not just line coverage)

```bash
# Run unit tests
pnpm test:run

# Run with coverage
pnpm test:coverage

# Watch mode during development
pnpm test
```

#### E2E Tests

- Use Playwright for E2E testing
- Place E2E tests in the `e2e/` directory

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Format

```
type(scope): description

[optional body]

[optional footer]
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

#### Examples

```bash
feat: add multi-language support
fix(api): resolve rate limiting issue
docs: update contributing guide
refactor(web): simplify state management
test: add unit tests for chat component
```

### Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions

---

<a id="japanese"></a>

## 日本語

TalkBoxへの貢献に興味を持っていただきありがとうございます！このドキュメントでは、貢献のためのガイドラインと手順を説明します。

### 目次

- [行動規範](#行動規範)
- [はじめに](#はじめに)
- [開発ワークフロー](#開発ワークフロー)
- [プルリクエストのプロセス](#プルリクエストのプロセス)
- [コーディング規約](#コーディング規約)
- [テスト](#テスト)
- [コミットメッセージ](#コミットメッセージ)

### 行動規範

このプロジェクトは[Contributor Covenant行動規範](CODE_OF_CONDUCT.md)に従います。参加することで、この規範を遵守することが求められます。

### はじめに

#### 必要条件

- Node.js 20+
- pnpm 9+
- MySQL 8.0+ (またはDocker)
- Git

#### セットアップ

```bash
# リポジトリをフォークしてクローン
git clone https://github.com/YOUR_USERNAME/talkbox.git
cd talkbox

# upstreamリモートを追加
git remote add upstream https://github.com/Watakumi/talkbox.git

# 依存関係をインストール
pnpm install

# 環境変数をコピー
cp .env.example .env
# .envを編集してAPIキーを設定

# DockerでMySQLを起動
cd docker && docker compose up -d db && cd ..

# 開発サーバーを起動
pnpm dev
```

### 開発ワークフロー

1. **upstreamと同期**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **フィーチャーブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   # または
   git checkout -b fix/your-bug-fix
   ```

3. **変更を加える**
   - コードを書く
   - テストを追加
   - 必要に応じてドキュメントを更新

4. **変更を検証**
   ```bash
   # 型チェック
   pnpm build

   # Lint
   pnpm lint

   # テストを実行
   pnpm test:run

   # E2Eテストを実行（推奨）
   pnpm test:e2e
   ```

5. **コミットしてプッシュ**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

### プルリクエストのプロセス

1. **提出前に**
   - すべてのテストが通ることを確認
   - ビルドが成功することを確認
   - 必要に応じてドキュメントを更新
   - 新機能にはテストを追加

2. **PRタイトル**
   - Conventional Commit形式を使用: `type: description`
   - 例:
     - `feat: add dark mode support`
     - `fix: resolve streaming issue on mobile`
     - `docs: update API documentation`

3. **PR説明**
   - どのような変更を行ったか説明
   - なぜこの変更が必要か説明
   - UI変更にはスクリーンショットを含める
   - 関連するIssueを参照 (例: `Fixes #123`)

4. **レビュープロセス**
   - メンテナーがPRをレビュー
   - 要求された変更に対応
   - 承認後、メンテナーがマージ

### コーディング規約

#### TypeScript

- TypeScript strictモードを使用
- オブジェクト形状には`type`より`interface`を優先
- エクスポートする関数には明示的な戻り値の型を指定
- `any`を避ける - 型が本当に不明な場合は`unknown`を使用

#### React

- フック付きの関数コンポーネントを使用
- コンポーネントは小さく、焦点を絞る
- propsには適切なTypeScript型を使用
- アクセシビリティのベストプラクティスに従う (WCAG)

#### スタイリング

- Tailwind CSSのユーティリティクラスを使用
- モバイルファーストのレスポンシブデザインに従う
- 一貫したスペーシングとタイポグラフィを維持

### テスト

#### ユニットテスト

- ユニットテストにはVitestを使用
- テストファイルはソースファイルの横に配置: `*.test.ts` または `*.test.tsx`
- 意味のあるテストカバレッジを目指す

```bash
# ユニットテストを実行
pnpm test:run

# カバレッジ付きで実行
pnpm test:coverage

# 開発中のウォッチモード
pnpm test
```

#### E2Eテスト

- E2EテストにはPlaywrightを使用
- E2Eテストは`e2e/`ディレクトリに配置

```bash
# E2Eテストを実行
pnpm test:e2e

# UIモードで実行
pnpm test:e2e:ui
```

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/)仕様に従います。

#### 形式

```
type(scope): description

[任意の本文]

[任意のフッター]
```

#### タイプ

| タイプ | 説明 |
|--------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | コードスタイル（フォーマットなど） |
| `refactor` | リファクタリング |
| `test` | テストの追加・更新 |
| `chore` | メンテナンスタスク |
| `perf` | パフォーマンス改善 |
| `ci` | CI/CDの変更 |

#### 例

```bash
feat: add multi-language support
fix(api): resolve rate limiting issue
docs: update contributing guide
refactor(web): simplify state management
test: add unit tests for chat component
```

### 質問がありますか？

質問がある場合は：
- `question`ラベルを付けてIssueを開く
- GitHub Discussionsでディスカッションを開始

---

Thank you for contributing! / 貢献ありがとうございます！
