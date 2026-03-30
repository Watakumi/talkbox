import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message as MessageType } from '@talkbox/shared';
import { Message } from './Message';
import { Spinner } from '../common/Spinner';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">{t('chat.welcome')}</h2>
          <p className="mt-2 text-sm">{t('chat.welcomeSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-thin"
      role="log"
      aria-live="polite"
      aria-label={t('chat.messageList')}
    >
      {messages.map((message) => (
        <Message key={message.id} role={message.role} content={message.content} />
      ))}

      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-500">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Spinner size="sm" />
            <span>{t('chat.loading')}</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
