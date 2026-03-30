import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { useConversationsStore } from '@/stores/conversations';
import { useChatStore } from '@/stores/chat';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function App() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { selectConversation } = useConversationsStore();
  const { clearMessages } = useChatStore();

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  const handleNewChat = useCallback(() => {
    selectConversation(null);
    clearMessages();
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [selectConversation, clearMessages, isDesktop]);

  return (
    <div className="flex h-full flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>

      <Header onMenuClick={handleMenuClick} onNewChat={handleNewChat} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          onSelectConversation={handleSelectConversation}
        />
        <ChatArea />
      </div>
    </div>
  );
}
