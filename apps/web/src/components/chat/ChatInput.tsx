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
        <div
          className={clsx(
            'flex items-center gap-2 rounded-xl border bg-surface px-3 transition-colors',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
            isOverLimit ? 'border-red-500' : 'border-border'
          )}
        >
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
              'flex-1 resize-none bg-transparent py-3 text-sm outline-none',
              'placeholder:text-gray-400',
              'disabled:cursor-not-allowed disabled:opacity-50'
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
              aria-label={t('chat.stop')}
            >
              <StopIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
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
