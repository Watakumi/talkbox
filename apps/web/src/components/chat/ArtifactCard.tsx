import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  TableCellsIcon,
  ChartBarIcon,
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export type ArtifactType = 'code' | 'document' | 'table' | 'chart' | 'summary';

interface ArtifactCardProps {
  type: ArtifactType;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  copyable?: boolean;
  copyContent?: string;
}

const typeIcons: Record<ArtifactType, React.ComponentType<{ className?: string }>> = {
  code: CodeBracketIcon,
  document: DocumentTextIcon,
  table: TableCellsIcon,
  chart: ChartBarIcon,
  summary: DocumentTextIcon,
};

const typeColors: Record<ArtifactType, string> = {
  code: 'border-l-blue-500 bg-blue-50',
  document: 'border-l-green-500 bg-green-50',
  table: 'border-l-purple-500 bg-purple-50',
  chart: 'border-l-orange-500 bg-orange-50',
  summary: 'border-l-teal-500 bg-teal-50',
};

const typeHeaderColors: Record<ArtifactType, string> = {
  code: 'bg-blue-100 text-blue-800',
  document: 'bg-green-100 text-green-800',
  table: 'bg-purple-100 text-purple-800',
  chart: 'bg-orange-100 text-orange-800',
  summary: 'bg-teal-100 text-teal-800',
};

export function ArtifactCard({
  type,
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  copyable = false,
  copyContent,
}: ArtifactCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const Icon = typeIcons[type];

  const handleCopy = useCallback(async () => {
    if (!copyContent) return;
    await navigator.clipboard.writeText(copyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyContent]);

  return (
    <div
      className={clsx(
        'my-4 overflow-hidden rounded-lg border border-l-4 shadow-sm',
        typeColors[type]
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between px-4 py-2',
          typeHeaderColors[type]
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {copyable && copyContent && (
            <button
              onClick={handleCopy}
              className="rounded p-1 hover:bg-white/50"
              aria-label={t('chat.copy')}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
            </button>
          )}
          {collapsible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded p-1 hover:bg-white/50"
              aria-label={expanded ? t('common.collapse') : t('common.expand')}
            >
              {expanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="bg-white p-4">
          {children}
        </div>
      )}
    </div>
  );
}
