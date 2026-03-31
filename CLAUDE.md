# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalkBox is an open-source chat UI for LLMs supporting Gemini, OpenAI (GPT-4o), and Anthropic (Claude). Built as a pnpm + Turborepo monorepo with TypeScript throughout.

## Commands

### Development
```bash
pnpm dev                    # Start all dev servers (frontend :5173, API :3001)
cd docker && docker compose up -d db  # Start MySQL
```

### Build & Test
```bash
pnpm build                  # Build all packages
pnpm test:run               # Run unit tests (Vitest)
pnpm test:coverage          # Run tests with coverage
pnpm test:e2e               # Run E2E tests (Playwright)
pnpm lint                   # Lint all packages
```

### Single App Commands
```bash
# API (apps/api)
pnpm --filter @talkbox/api dev
pnpm --filter @talkbox/api test:run
pnpm --filter @talkbox/api db:generate   # Generate Drizzle migrations
pnpm --filter @talkbox/api db:migrate    # Run migrations
pnpm --filter @talkbox/api db:studio     # Open Drizzle Studio

# Web (apps/web)
pnpm --filter @talkbox/web dev
pnpm --filter @talkbox/web test:run
pnpm --filter @talkbox/web storybook     # Start Storybook
```

### Running Single Test
```bash
pnpm --filter @talkbox/api vitest run src/routes/chat.test.ts
pnpm --filter @talkbox/web vitest run src/stores/chat.test.ts
```

## Architecture

### Monorepo Structure
- **apps/api** - Hono backend (Node.js, TypeScript)
- **apps/web** - React 18 frontend (Vite, TypeScript)
- **packages/shared** - Shared TypeScript types between apps

### API Layer (apps/api/src/)
```
routes/          # Hono route handlers
  chat.ts        # SSE streaming chat endpoint
  conversations.ts # CRUD for conversations
  mcp.ts         # Model Context Protocol integration
services/
  llm/           # LLM provider abstraction
    index.ts     # Provider factory (createLLMProvider)
    types.ts     # LLMProvider interface, LLMStreamEvent
    gemini.ts    # Google Gemini implementation
    openai.ts    # OpenAI implementation
    anthropic.ts # Anthropic Claude implementation
  mcp/           # MCP server management
db/
  schema.ts      # Drizzle ORM schema (users, conversations, messages)
  index.ts       # Database connection
middleware/
  auth.ts        # Authentication middleware
```

### Web Layer (apps/web/src/)
```
components/
  chat/          # ChatArea, ChatInput, Message, MessageList
  sidebar/       # Sidebar, ConversationItem
  settings/      # SettingsModal
  common/        # Button, Spinner
  layout/        # Header
stores/          # Zustand state management
  chat.ts        # Message streaming, SSE handling
  conversations.ts # Conversation list state
  settings.ts    # User preferences (model, language, system prompt)
services/
  api.ts         # API client for backend
hooks/           # Custom React hooks
i18n/            # i18next localization (en, ja)
```

### Key Patterns

**LLM Provider Interface**: All LLM providers implement `LLMProvider` interface with async generator for streaming:
```typescript
interface LLMProvider {
  chat(messages: LLMMessage[], options?: LLMChatOptions): AsyncGenerator<LLMStreamEvent>;
}
```

**SSE Streaming**: Chat responses use Server-Sent Events with typed events (start, chunk, tool_call, tool_result, done, error) defined in `@talkbox/shared`.

**State Management**: Zustand stores handle client-side state. `useChatStore` manages message streaming with AbortController for cancellation.

**Database**: Drizzle ORM with MySQL. Schema defines users, conversations, and messages tables with proper indexes.

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Headless UI, Zustand |
| Backend | Hono, Drizzle ORM, MySQL |
| Testing | Vitest (unit), Playwright (E2E), Storybook (components) |
| Build | Turborepo, pnpm, tsup |

## Conventions

- Test files: `*.test.ts` / `*.test.tsx` next to source files
- Stories: `*.stories.tsx` for Storybook components
- Commit messages: Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- TypeScript strict mode enabled
