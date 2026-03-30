import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import { Button } from '@/components/common/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  maxLength?: number;
}

export function ChatInput({ onSend, onStop, isLoading, maxLength = 4000 }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || isLoading) return;
      onSend(trimmed);
      setMessage('');
    },
    [message, isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const isOverLimit = message.length > maxLength;
  const canSubmit = message.trim().length > 0 && !isLoading && !isOverLimit;

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-surface p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative">
          <label htmlFor="chat-input" className="sr-only">
            {t('chat.placeholder')}
          </label>
          <textarea
            id="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            rows={1}
            className={clsx(
              'w-full resize-none rounded-xl border bg-surface py-3 pl-4 pr-14 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isOverLimit ? 'border-red-500' : 'border-border'
            )}
            style={{ maxHeight: '200px' }}
            aria-invalid={isOverLimit || undefined}
            aria-describedby={isOverLimit ? 'char-limit-error' : undefined}
          />
          {isLoading ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onStop}
              className="absolute bottom-2 right-2"
              aria-label={t('chat.stop')}
            >
              <StopIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className="absolute bottom-2 right-2"
              aria-label={t('chat.send')}
            >
              <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {isOverLimit && (
          <p id="char-limit-error" className="mt-1 text-xs text-red-600" role="alert">
            {t('chat.characterLimit', { current: message.length, max: maxLength })}
          </p>
        )}
      </div>
    </form>
  );
}
