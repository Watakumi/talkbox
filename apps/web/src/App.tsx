import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useConversationsStore } from '@/stores/conversations';
import { useChatStore } from '@/stores/chat';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { exportConversation, type ExportFormat } from '@/utils/export';

export function App() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { conversations, currentId, selectConversation } = useConversationsStore();
  const { messages, clearMessages } = useChatStore();

  const currentConversation = conversations.find((c) => c.id === currentId);
  const canExport = !!currentConversation && messages.length > 0;

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

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!currentConversation) return;
      exportConversation(
        {
          conversation: currentConversation,
          messages,
        },
        format
      );
    },
    [currentConversation, messages]
  );

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>

      <Header
        onMenuClick={handleMenuClick}
        onNewChat={handleNewChat}
        onExport={handleExport}
        canExport={canExport}
        onSettings={handleOpenSettings}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          onSelectConversation={handleSelectConversation}
        />
        <ChatArea />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </div>
  );
}
