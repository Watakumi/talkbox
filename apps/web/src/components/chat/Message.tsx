import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import type { MessageRole } from '@talkbox/shared';

interface MessageProps {
  role: MessageRole;
  content: string;
}

export function Message({ role, content }: MessageProps) {
  const { t } = useTranslation();
  const isUser = role === 'user';

  return (
    <article
      className={clsx('py-6', isUser ? 'bg-surface' : 'bg-surface-secondary')}
      aria-label={isUser ? t('chat.userMessage') : t('chat.assistantMessage')}
    >
      <div className="mx-auto flex max-w-3xl gap-4 px-4">
        <div
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isUser ? 'bg-primary-600 text-white' : 'bg-surface-tertiary text-gray-600'
          )}
          aria-hidden="true"
        >
          {isUser ? (
            <UserIcon className="h-5 w-5" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm leading-relaxed text-gray-900">
          {content ? (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:bg-gray-800 prose-pre:text-gray-100">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-gray-400">{t('chat.loading')}</span>
          )}
        </div>
      </div>
    </article>
  );
}
