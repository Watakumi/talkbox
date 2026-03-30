import { useState, useCallback, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserIcon, SparklesIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { MermaidDiagram } from './MermaidDiagram';
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

  // Handle Mermaid diagrams
  if (language === 'mermaid') {
    return <MermaidDiagram chart={children} />;
  }

  return (
    <div className="group relative my-4">
      {/* Language badge and copy button */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        {language && (
          <span className="rounded bg-gray-600 px-2 py-0.5 text-xs text-gray-300">
            {language}
          </span>
        )}
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
        customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem', paddingTop: '2.5rem' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// Custom table component with nice styling
function Table({ children, ...props }: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" {...props}>
        {children}
      </table>
    </div>
  );
}

function TableHead({ children, ...props }: ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  );
}

function TableRow({ children, ...props }: ComponentPropsWithoutRef<'tr'>) {
  return (
    <tr className="hover:bg-gray-50" {...props}>
      {children}
    </tr>
  );
}

function TableHeader({ children, ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ children, ...props }: ComponentPropsWithoutRef<'td'>) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" {...props}>
      {children}
    </td>
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
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return <CodeBlock language={match[1]} children={codeString} />;
                    }

                    return (
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-pink-600" {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Enhanced table components
                  table: Table,
                  thead: TableHead,
                  tr: TableRow,
                  th: TableHeader,
                  td: TableCell,
                  // Enhanced blockquote
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="my-4 border-l-4 border-primary-500 bg-primary-50 py-2 pl-4 pr-2 italic text-gray-700"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  // Enhanced horizontal rule
                  hr: (props) => (
                    <hr className="my-6 border-t-2 border-gray-200" {...props} />
                  ),
                  // Enhanced links
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 underline hover:text-primary-700"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
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
