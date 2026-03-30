import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { Bars3Icon, LanguageIcon, PlusIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

interface HeaderProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

export function Header({ onMenuClick, onNewChat }: HeaderProps) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label={t('header.toggleSidebar')}
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t('header.title')}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Menu as="div" className="relative">
          <Menu.Button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label={t('header.changeLanguage')}
          >
            <LanguageIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-lg border border-border bg-surface p-1 shadow-lg focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => changeLanguage('en')}
                  className={clsx(
                    'flex w-full items-center rounded px-3 py-2 text-left text-sm',
                    active && 'bg-surface-tertiary'
                  )}
                >
                  English
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => changeLanguage('ja')}
                  className={clsx(
                    'flex w-full items-center rounded px-3 py-2 text-left text-sm',
                    active && 'bg-surface-tertiary'
                  )}
                >
                  日本語
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>

        <Button
          onClick={onNewChat}
          size="sm"
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          {t('header.newChat')}
        </Button>
      </div>
    </header>
  );
}
