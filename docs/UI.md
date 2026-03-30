# TalkBox UI設計

## 画面構成

```
┌────────────────────────────────────────────────────────────┐
│  Header (ロゴ / ユーザーメニュー)                            │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│   Sidebar    │              ChatArea                       │
│              │                                             │
│  ┌────────┐  │  ┌─────────────────────────────────────┐   │
│  │新規作成│  │  │                                     │   │
│  └────────┘  │  │          MessageList                │   │
│              │  │                                     │   │
│  会話履歴    │  │   ┌─────────────────────────────┐   │   │
│  ─────────   │  │   │ User: こんにちは             │   │   │
│  ・会話1     │  │   └─────────────────────────────┘   │   │
│  ・会話2     │  │                                     │   │
│  ・会話3     │  │   ┌─────────────────────────────┐   │   │
│              │  │   │ Assistant: こんにちは！      │   │   │
│              │  │   │ 何かお手伝いできますか？      │   │   │
│              │  │   └─────────────────────────────┘   │   │
│              │  │                                     │   │
│              │  └─────────────────────────────────────┘   │
│              │                                             │
│              │  ┌─────────────────────────────────────┐   │
│              │  │  ChatInput                          │   │
│              │  │  [メッセージを入力...        ] [送信]│   │
│              │  └─────────────────────────────────────┘   │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

## コンポーネント構成

```
src/components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   ├── Spinner.tsx
│   └── Modal.tsx
│
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
│
├── chat/
│   ├── ChatArea.tsx        # チャットエリア全体
│   ├── MessageList.tsx     # メッセージ一覧
│   ├── Message.tsx         # 個別メッセージ
│   ├── ChatInput.tsx       # 入力フォーム
│   └── StreamingText.tsx   # ストリーミング表示
│
├── sidebar/
│   ├── ConversationList.tsx    # 会話履歴一覧
│   ├── ConversationItem.tsx    # 個別会話アイテム
│   └── NewChatButton.tsx       # 新規会話ボタン
│
└── auth/
    ├── LoginButton.tsx
    └── UserMenu.tsx
```

## コンポーネント詳細

### Layout

```tsx
// components/layout/Layout.tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

### ChatArea

```tsx
// components/chat/ChatArea.tsx
export function ChatArea() {
  const { messages, isStreaming } = useChat();

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isStreaming={isStreaming} />
      <ChatInput />
    </div>
  );
}
```

### Message

```tsx
// components/chat/Message.tsx
interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function Message({ role, content, isStreaming }: MessageProps) {
  return (
    <div className={cn(
      "flex gap-4 p-4",
      role === 'user' ? "bg-white" : "bg-gray-50"
    )}>
      <Avatar role={role} />
      <div className="flex-1 prose">
        {isStreaming ? (
          <StreamingText content={content} />
        ) : (
          <Markdown content={content} />
        )}
      </div>
    </div>
  );
}
```

### ChatInput

```tsx
// components/chat/ChatInput.tsx
export function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading } = useChat();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    sendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2 max-w-3xl mx-auto">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 resize-none border rounded-lg p-3"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : '送信'}
        </Button>
      </div>
    </form>
  );
}
```

### Sidebar

```tsx
// components/sidebar/Sidebar.tsx
export function Sidebar() {
  const { conversations, currentId, selectConversation } = useConversations();

  return (
    <aside className="w-64 border-r bg-gray-100 flex flex-col">
      <div className="p-4">
        <NewChatButton />
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          currentId={currentId}
          onSelect={selectConversation}
        />
      </nav>
    </aside>
  );
}
```

## 状態管理

### Zustand Store

```tsx
// stores/chat.ts
interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,

  sendMessage: async (content) => {
    // ユーザーメッセージを追加
    const userMessage = { id: uuid(), role: 'user', content };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
    }));

    // ストリーミングレスポンスを処理
    const response = await fetch('/api/v1/chat', { ... });
    const reader = response.body.getReader();
    // SSE処理...
  },
}));
```

```tsx
// stores/conversations.ts
interface ConversationsStore {
  conversations: Conversation[];
  currentId: string | null;
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => void;
  createConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
}
```

## カスタムフック

```tsx
// hooks/useChat.ts
export function useChat() {
  const { messages, isStreaming, sendMessage, setMessages } = useChatStore();
  const { currentId } = useConversationsStore();

  useEffect(() => {
    if (currentId) {
      // 会話が変わったらメッセージを取得
      fetchMessages(currentId).then(setMessages);
    }
  }, [currentId]);

  return { messages, isStreaming, sendMessage };
}
```

## レスポンシブ対応

```tsx
// モバイル: サイドバーをオーバーレイ表示
// デスクトップ: サイドバーを常時表示

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップ */}
        <aside className="hidden md:block w-64 border-r">
          <Sidebar />
        </aside>

        {/* モバイル */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <Sidebar />
        </Sheet>

        <main className="flex-1">
          <ChatArea />
        </main>
      </div>
    </div>
  );
}
```

## ダークモード (将来対応)

```tsx
// Tailwind CSS のダークモードを使用
// className="bg-white dark:bg-gray-900"
```
