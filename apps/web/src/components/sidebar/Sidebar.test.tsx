import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { Conversation } from '@talkbox/shared';

// Mock ResizeObserver for Headless UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sidebar.conversations': 'Conversations',
        'sidebar.search': 'Search conversations',
        'sidebar.noConversations': 'No conversations yet',
        'sidebar.noResults': 'No results found',
        'sidebar.deleteConversation': 'Delete conversation',
        'common.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'First Conversation',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Second Conversation',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockConversationsStore = {
  conversations: mockConversations,
  currentId: null as string | null,
  fetchConversations: vi.fn(),
  selectConversation: vi.fn(),
  deleteConversation: vi.fn(),
};

const mockChatStore = {
  clearMessages: vi.fn(),
};

vi.mock('@/stores/conversations', () => ({
  useConversationsStore: () => mockConversationsStore,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}));

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationsStore.conversations = mockConversations;
    mockConversationsStore.currentId = null;
  });

  describe('rendering', () => {
    it('should render with role="navigation"', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: 'Conversations' })).toHaveAttribute('aria-label', 'Conversations');
    });

    it('should render search input', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search conversations')).toBeInTheDocument();
    });

    it('should render conversation list', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('First Conversation')).toBeInTheDocument();
      expect(screen.getByText('Second Conversation')).toBeInTheDocument();
    });

    it('should fetch conversations on mount', () => {
      render(<Sidebar {...defaultProps} />);
      expect(mockConversationsStore.fetchConversations).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no conversations', () => {
      mockConversationsStore.conversations = [];
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should filter conversations by search query', () => {
      render(<Sidebar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search conversations');
      fireEvent.change(searchInput, { target: { value: 'First' } });

      expect(screen.getByText('First Conversation')).toBeInTheDocument();
      expect(screen.queryByText('Second Conversation')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(<Sidebar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search conversations');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      render(<Sidebar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search conversations');
      fireEvent.change(searchInput, { target: { value: 'FIRST' } });

      expect(screen.getByText('First Conversation')).toBeInTheDocument();
    });
  });

  describe('conversation selection', () => {
    it('should call selectConversation when conversation is clicked', () => {
      render(<Sidebar {...defaultProps} />);

      const item = screen.getByRole('button', { name: /First Conversation/i });
      fireEvent.click(item);

      expect(mockConversationsStore.selectConversation).toHaveBeenCalledWith('1');
    });

    it('should call onSelectConversation callback when provided', () => {
      const onSelectConversation = vi.fn();
      render(<Sidebar {...defaultProps} onSelectConversation={onSelectConversation} />);

      const item = screen.getByRole('button', { name: /First Conversation/i });
      fireEvent.click(item);

      expect(onSelectConversation).toHaveBeenCalled();
    });
  });

  describe('conversation deletion', () => {
    it('should call deleteConversation when delete button is clicked', async () => {
      mockConversationsStore.deleteConversation.mockResolvedValue(undefined);
      render(<Sidebar {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete conversation' });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConversationsStore.deleteConversation).toHaveBeenCalledWith('1');
      });
    });

    it('should clear messages when deleting current conversation', async () => {
      mockConversationsStore.currentId = '1';
      mockConversationsStore.deleteConversation.mockResolvedValue(undefined);
      render(<Sidebar {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete conversation' });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockChatStore.clearMessages).toHaveBeenCalled();
      });
    });
  });

  describe('mobile close button', () => {
    it('should render close button', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<Sidebar {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('active conversation styling', () => {
    it('should mark active conversation with aria-current', () => {
      mockConversationsStore.currentId = '1';
      render(<Sidebar {...defaultProps} />);

      const activeItem = screen.getByRole('button', { name: /First Conversation/i });
      expect(activeItem).toHaveAttribute('aria-current', 'true');
    });
  });
});
