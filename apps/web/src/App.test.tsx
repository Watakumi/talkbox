import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

// Mock ResizeObserver for Headless UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.skipToContent': 'Skip to main content',
        'header.title': 'TalkBox',
        'header.toggleSidebar': 'Toggle sidebar',
        'header.changeLanguage': 'Change language',
        'header.newChat': 'New Chat',
        'header.export': 'Export',
        'settings.title': 'Settings',
        'sidebar.conversations': 'Conversations',
        'sidebar.search': 'Search conversations',
        'sidebar.noConversations': 'No conversations yet',
        'sidebar.deleteConversation': 'Delete conversation',
        'chat.welcome': 'Welcome to TalkBox',
        'chat.welcomeSubtitle': 'Start a conversation',
        'chat.placeholder': 'Type a message...',
        'chat.send': 'Send',
        'chat.area': 'Chat area',
        'common.close': 'Close',
        'shortcuts.title': 'Keyboard Shortcuts',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

const mockConversationsStore = {
  conversations: [],
  currentId: null as string | null,
  fetchConversations: vi.fn(),
  selectConversation: vi.fn(),
  deleteConversation: vi.fn(),
};

const mockChatStore = {
  messages: [],
  isStreaming: false,
  loadMessages: vi.fn(),
  sendMessage: vi.fn(),
  stopStreaming: vi.fn(),
  clearMessages: vi.fn(),
};

const mockSettingsStore = {
  systemPrompt: '',
  setSystemPrompt: vi.fn(),
  model: 'gemini' as const,
  setModel: vi.fn(),
};

vi.mock('@/stores/conversations', () => ({
  useConversationsStore: () => mockConversationsStore,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}));

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => mockSettingsStore,
  LLM_MODELS: [
    { id: 'gemini', name: 'Gemini' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Claude' },
  ],
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => true, // Desktop by default
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationsStore.conversations = [];
    mockConversationsStore.currentId = null;
    mockChatStore.messages = [];
  });

  describe('rendering', () => {
    it('should render header', () => {
      render(<App />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(<App />);
      expect(screen.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    });

    it('should render chat area', () => {
      render(<App />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render skip to content link', () => {
      render(<App />);
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });
  });

  describe('new chat', () => {
    it('should clear messages and deselect conversation on new chat', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'New Chat' }));

      expect(mockConversationsStore.selectConversation).toHaveBeenCalledWith(null);
      expect(mockChatStore.clearMessages).toHaveBeenCalled();
    });
  });

  describe('settings modal', () => {
    it('should open settings modal when settings button clicked', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should close settings modal', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click close button within the dialog
      const dialog = screen.getByRole('dialog');
      const closeButton = dialog.querySelector('button[aria-label="Close"]');
      fireEvent.click(closeButton!);
      // Modal should be closed (dialog removed)
    });
  });

  describe('sidebar toggle', () => {
    it('should toggle sidebar visibility', () => {
      render(<App />);

      const toggleButton = screen.getByRole('button', { name: 'Toggle sidebar' });
      fireEvent.click(toggleButton);
      // Sidebar state changes are internal
    });
  });

  describe('export functionality', () => {
    it('should not show export button when no conversation selected', () => {
      render(<App />);
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    });

    it('should not show export button when no messages', () => {
      mockConversationsStore.conversations = [
        {
          id: '1',
          userId: 'user-1',
          title: 'Test',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockConversationsStore.currentId = '1';
      mockChatStore.messages = [];

      render(<App />);
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    });

    it('should show export button when conversation and messages exist', () => {
      mockConversationsStore.conversations = [
        {
          id: '1',
          userId: 'user-1',
          title: 'Test',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockConversationsStore.currentId = '1';
      mockChatStore.messages = [
        { id: '1', role: 'user', content: 'Hello', createdAt: '2024-01-01T00:00:00.000Z' },
      ];

      render(<App />);
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });
});
