import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Message } from './Message';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chat.userMessage': 'Your message',
        'chat.assistantMessage': 'Assistant message',
        'chat.copy': 'Copy message',
        'chat.loading': 'Thinking...',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};
Object.assign(navigator, { clipboard: mockClipboard });

describe('Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render user message with correct aria-label', () => {
      render(<Message role="user" content="Hello" />);
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        'Your message'
      );
    });

    it('should render assistant message with correct aria-label', () => {
      render(<Message role="assistant" content="Hi there" />);
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        'Assistant message'
      );
    });

    it('should render message content', () => {
      render(<Message role="user" content="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should show loading text when content is empty', () => {
      render(<Message role="assistant" content="" />);
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });
  });

  describe('user vs assistant styling', () => {
    it('should have different background for user message', () => {
      render(<Message role="user" content="Hello" />);
      expect(screen.getByRole('article')).toHaveClass('bg-surface');
    });

    it('should have different background for assistant message', () => {
      render(<Message role="assistant" content="Hi" />);
      expect(screen.getByRole('article')).toHaveClass('bg-surface-secondary');
    });
  });

  describe('markdown rendering', () => {
    it('should render bold text', () => {
      render(<Message role="assistant" content="**bold text**" />);
      expect(screen.getByText('bold text')).toBeInTheDocument();
    });

    it('should render inline code', () => {
      render(<Message role="assistant" content="Use `console.log()`" />);
      const code = screen.getByText('console.log()');
      expect(code.tagName).toBe('CODE');
    });

    it('should render links', () => {
      render(<Message role="assistant" content="[Click here](https://example.com)" />);
      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('copy functionality', () => {
    it('should copy message to clipboard when copy button clicked', async () => {
      render(<Message role="user" content="Hello World" />);

      // Find copy button (there might be multiple, get the message copy button)
      const copyButtons = screen.getAllByRole('button', { name: 'Copy message' });
      const messageCopyButton = copyButtons[copyButtons.length - 1];

      fireEvent.click(messageCopyButton);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
    });

    it('should not show copy button when content is empty', () => {
      render(<Message role="assistant" content="" />);
      expect(screen.queryByRole('button', { name: 'Copy message' })).not.toBeInTheDocument();
    });
  });

  describe('code block', () => {
    it('should render code block with syntax highlighting', () => {
      const code = '```javascript\nconst x = 1;\n```';
      render(<Message role="assistant" content={code} />);

      // The code should be rendered
      expect(screen.getByText(/const/)).toBeInTheDocument();
    });
  });
});
