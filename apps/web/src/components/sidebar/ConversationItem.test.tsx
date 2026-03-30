import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@talkbox/shared';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sidebar.noConversations': 'No conversations',
        'sidebar.deleteConversation': 'Delete conversation',
      };
      return translations[key] || key;
    },
  }),
}));

const mockConversation: Conversation = {
  id: '1',
  userId: 'user-1',
  title: 'Test Conversation',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ConversationItem', () => {
  const defaultProps = {
    conversation: mockConversation,
    isActive: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render conversation title', () => {
      render(<ConversationItem {...defaultProps} />);
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('should render fallback text when title is empty', () => {
      const emptyTitleConversation = { ...mockConversation, title: '' };
      render(<ConversationItem {...defaultProps} conversation={emptyTitleConversation} />);
      expect(screen.getByText('No conversations')).toBeInTheDocument();
    });

    it('should have role="button" and tabIndex', () => {
      render(<ConversationItem {...defaultProps} />);
      const item = screen.getByRole('button', { name: /Test Conversation/i });
      expect(item).toHaveAttribute('tabindex', '0');
    });

    it('should have delete button with aria-label', () => {
      render(<ConversationItem {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Delete conversation' })).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should not have aria-current when not active', () => {
      render(<ConversationItem {...defaultProps} isActive={false} />);
      const item = screen.getByRole('button', { name: /Test Conversation/i });
      expect(item).not.toHaveAttribute('aria-current');
    });

    it('should have aria-current="true" when active', () => {
      render(<ConversationItem {...defaultProps} isActive={true} />);
      const item = screen.getByRole('button', { name: /Test Conversation/i });
      expect(item).toHaveAttribute('aria-current', 'true');
    });

    it('should have active styling class when active', () => {
      render(<ConversationItem {...defaultProps} isActive={true} />);
      const item = screen.getByRole('button', { name: /Test Conversation/i });
      expect(item).toHaveClass('bg-primary-50');
    });
  });

  describe('interactions', () => {
    it('should call onSelect when clicked', () => {
      const onSelect = vi.fn();
      render(<ConversationItem {...defaultProps} onSelect={onSelect} />);

      const item = screen.getByRole('button', { name: /Test Conversation/i });
      fireEvent.click(item);

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when Enter key is pressed', () => {
      const onSelect = vi.fn();
      render(<ConversationItem {...defaultProps} onSelect={onSelect} />);

      const item = screen.getByRole('button', { name: /Test Conversation/i });
      fireEvent.keyDown(item, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when Space key is pressed', () => {
      const onSelect = vi.fn();
      render(<ConversationItem {...defaultProps} onSelect={onSelect} />);

      const item = screen.getByRole('button', { name: /Test Conversation/i });
      fireEvent.keyDown(item, { key: ' ' });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelect for other keys', () => {
      const onSelect = vi.fn();
      render(<ConversationItem {...defaultProps} onSelect={onSelect} />);

      const item = screen.getByRole('button', { name: /Test Conversation/i });
      fireEvent.keyDown(item, { key: 'a' });

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('should call onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      render(<ConversationItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete conversation' });
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should not propagate click event when delete button clicked', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      render(<ConversationItem {...defaultProps} onSelect={onSelect} onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete conversation' });
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
