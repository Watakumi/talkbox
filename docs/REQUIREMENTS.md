# TalkBox 要件定義

## 概要

TalkBoxは、OSSのLLMチャットUIです。Streamlitのような手軽さで、ChatGPTライクな体験を提供します。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React + TypeScript |
| バックエンド | Hono (TypeScript) |
| データベース | MySQL（抽象化層あり） |
| デプロイ | Cloud Run |
| 認証 | OAuth (Google, GitHub) |

## 主要機能

### コア機能

- **ストリーミング応答**: LLMからの応答をリアルタイムで表示
- **会話履歴**: 会話の保存・表示・管理
- **マルチユーザー対応**: ユーザーごとの履歴分離
- **シンプルUI**: ChatGPTライクな直感的インターフェース

### UI要件

- チャット入力欄（下部固定）
- メッセージ一覧（スクロール可能）
- サイドバー（会話履歴一覧）
- レスポンシブデザイン

## OSS向け設計方針

### 拡張性

| 項目 | 方針 |
|------|------|
| LLM | プラガブル設計（初期: Gemini、拡張: OpenAI, Claude等） |
| DB | 抽象化（MySQL, PostgreSQL, SQLite対応可） |
| 認証 | プロバイダー差し替え可能 |

### 設定

- 環境変数で完結
- `.env.example` を提供

### デプロイ

- Docker Compose一発起動
- Cloud Run対応
- ローカル開発環境も容易にセットアップ可能

## ライセンス

MIT License

## 将来的な拡張候補

- OpenAI (GPT-4) 対応
- Anthropic (Claude) 対応
- ファイルアップロード
- コードハイライト / Markdown対応
- 会話のエクスポート機能
- カスタムプロンプトテンプレート
