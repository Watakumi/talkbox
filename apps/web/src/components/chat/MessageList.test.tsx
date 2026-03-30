import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { Message } from '@talkbox/shared';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chat.welcome': 'Welcome to TalkBox',
        'chat.welcomeSubtitle': 'Start a conversation by typing a message below.',
        'chat.messageList': 'Message list',
        'chat.loading': 'Thinking...',
        'chat.userMessage': 'Your message',
        'chat.assistantMessage': 'Assistant message',
        'chat.copy': 'Copy message',
      };
      return translations[key] || key;
    },
  }),
}));

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi there!',
    createdAt: '2024-01-01T00:00:01.000Z',
  },
];

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should show welcome message when no messages', () => {
      render(<MessageList messages={[]} />);

      expect(screen.getByText('Welcome to TalkBox')).toBeInTheDocument();
      expect(screen.getByText('Start a conversation by typing a message below.')).toBeInTheDocument();
    });

    it('should not show message list role when empty', () => {
      render(<MessageList messages={[]} />);

      expect(screen.queryByRole('log')).not.toBeInTheDocument();
    });
  });

  describe('with messages', () => {
    it('should render all messages', () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('should have role="log" with aria attributes', () => {
      render(<MessageList messages={mockMessages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-live', 'polite');
      expect(log).toHaveAttribute('aria-label', 'Message list');
    });

    it('should render messages as articles', () => {
      render(<MessageList messages={mockMessages} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(2);
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      render(<MessageList messages={mockMessages} isLoading={true} />);

      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });

    it('should show spinner when loading', () => {
      render(<MessageList messages={mockMessages} isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show loading indicator when isLoading is false', () => {
      render(<MessageList messages={mockMessages} isLoading={false} />);

      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    });
  });

  describe('scroll behavior', () => {
    it('should have scroll container', () => {
      render(<MessageList messages={mockMessages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveClass('overflow-y-auto');
    });
  });
});
