import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores/chat';
import { useConversationsStore } from '@/stores/conversations';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatArea() {
  const { t } = useTranslation();
  const { currentId, createConversation } = useConversationsStore();
  const { messages, isStreaming, loadMessages, sendMessage, stopStreaming, clearMessages } = useChatStore();
  const lastLoadedId = useRef<string | null>(null);

  useEffect(() => {
    if (currentId && currentId !== lastLoadedId.current) {
      loadMessages(currentId);
      lastLoadedId.current = currentId;
    } else if (!currentId) {
      clearMessages();
      lastLoadedId.current = null;
    }
  }, [currentId, loadMessages, clearMessages]);

  const handleSend = async (content: string) => {
    let conversationId = currentId;

    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }
      lastLoadedId.current = conversationId;
    }

    await sendMessage(conversationId, content);
  };

  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col overflow-hidden"
      role="main"
      aria-label={t('chat.area')}
    >
      <MessageList messages={messages} isLoading={isStreaming} />
      <ChatInput onSend={handleSend} onStop={stopStreaming} isLoading={isStreaming} />
    </main>
  );
}
