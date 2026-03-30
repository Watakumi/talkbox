import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Conversation } from '@talkbox/shared';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx(
        'group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-700 hover:bg-surface-tertiary'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-current={isActive ? 'true' : undefined}
    >
      <ChatBubbleLeftIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-sm">
        {conversation.title || t('sidebar.noConversations')}
      </span>
      <button
        className={clsx(
          'shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600',
          'opacity-0 group-hover:opacity-100 focus:opacity-100'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={t('sidebar.deleteConversation')}
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
