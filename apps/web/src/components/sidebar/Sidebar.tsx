import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useConversationsStore } from '@/stores/conversations';
import { useChatStore } from '@/stores/chat';
import { ConversationItem } from './ConversationItem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation?: () => void;
}

export function Sidebar({ isOpen, onClose, onSelectConversation }: SidebarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    conversations,
    currentId,
    fetchConversations,
    selectConversation,
    deleteConversation,
  } = useConversationsStore();
  const { clearMessages } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleSelect = (id: string) => {
    selectConversation(id);
    onSelectConversation?.();
  };

  const handleDelete = async (id: string) => {
    await deleteConversation(id);
    if (currentId === id) {
      clearMessages();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <Transition
        show={isOpen}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      </Transition>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-border bg-surface-secondary transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label={t('sidebar.conversations')}
      >
        {/* Mobile header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:hidden">
          <span className="font-medium text-gray-900">{t('sidebar.conversations')}</span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label={t('common.close')}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search input */}
        <div className="shrink-0 border-b border-border p-2">
          <div className="relative">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sidebar.search')}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              aria-label={t('sidebar.search')}
            />
          </div>
        </div>

        {/* Conversation list */}
        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">
              {t('sidebar.noConversations')}
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">
              {t('sidebar.noResults')}
            </p>
          ) : (
            <ul role="list" className="space-y-1">
              {filteredConversations.map((conversation) => (
                <li key={conversation.id}>
                  <ConversationItem
                    conversation={conversation}
                    isActive={conversation.id === currentId}
                    onSelect={() => handleSelect(conversation.id)}
                    onDelete={() => handleDelete(conversation.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
