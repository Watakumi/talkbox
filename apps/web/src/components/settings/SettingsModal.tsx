import { Fragment, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Button } from '@/components/common/Button';
import { useSettingsStore, LLM_MODELS } from '@/stores/settings';
import type { LLMProviderType } from '@talkbox/shared';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { systemPrompt, setSystemPrompt, model, setModel } = useSettingsStore();
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [localModel, setLocalModel] = useState<LLMProviderType>(model);

  useEffect(() => {
    if (isOpen) {
      setLocalPrompt(systemPrompt);
      setLocalModel(model);
    }
  }, [isOpen, systemPrompt, model]);

  const handleSave = useCallback(() => {
    setSystemPrompt(localPrompt);
    setModel(localModel);
    onClose();
  }, [localPrompt, localModel, setSystemPrompt, setModel, onClose]);

  const handleReset = useCallback(() => {
    setLocalPrompt('');
    setLocalModel('gemini');
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {t('settings.title')}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label={t('common.close')}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="model-select"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('settings.model')}
                    </label>
                    <select
                      id="model-select"
                      value={localModel}
                      onChange={(e) => setLocalModel(e.target.value as LLMProviderType)}
                      className={clsx(
                        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      )}
                    >
                      {LLM_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('settings.modelHint')}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="system-prompt"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('settings.systemPrompt')}
                    </label>
                    <textarea
                      id="system-prompt"
                      value={localPrompt}
                      onChange={(e) => setLocalPrompt(e.target.value)}
                      placeholder={t('settings.systemPromptPlaceholder')}
                      rows={6}
                      className={clsx(
                        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        'placeholder:text-gray-400 resize-none'
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('settings.systemPromptHint')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="secondary" onClick={handleReset}>
                    {t('settings.reset')}
                  </Button>
                  <Button onClick={handleSave}>{t('settings.save')}</Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
