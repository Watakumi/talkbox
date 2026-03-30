import { useState, useCallback, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserIcon, SparklesIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { MessageRole } from '@talkbox/shared';

interface MessageProps {
  role: MessageRole;
  content: string;
}

interface CodeBlockProps {
  language: string;
  children: string;
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="rounded bg-gray-700 p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-gray-600 hover:text-white group-hover:opacity-100"
          aria-label={t('chat.copy')}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-400" />
          ) : (
            <ClipboardIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function Message({ role, content }: MessageProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopyMessage = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <article
      className={clsx('group relative py-6', isUser ? 'bg-surface' : 'bg-surface-secondary')}
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
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown
                components={{
                  code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return <CodeBlock language={match[1]} children={codeString} />;
                    }

                    return (
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="text-gray-400">{t('chat.loading')}</span>
          )}
        </div>

        {/* Copy message button */}
        {content && (
          <div className="shrink-0">
            <button
              onClick={handleCopyMessage}
              className="rounded p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
              aria-label={t('chat.copy')}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
