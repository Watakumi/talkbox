import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatArea } from './ChatArea';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chat.area': 'Chat area',
        'chat.welcome': 'Welcome to TalkBox',
        'chat.welcomeSubtitle': 'Start a conversation by typing a message below.',
        'chat.messageList': 'Message list',
        'chat.placeholder': 'Type a message...',
        'chat.send': 'Send',
        'chat.stop': 'Stop',
        'chat.loading': 'Thinking...',
        'chat.userMessage': 'Your message',
        'chat.assistantMessage': 'Assistant message',
        'chat.copy': 'Copy message',
      };
      return translations[key] || key;
    },
  }),
}));

const mockChatStore = {
  messages: [],
  isStreaming: false,
  loadMessages: vi.fn(),
  sendMessage: vi.fn(),
  stopStreaming: vi.fn(),
  clearMessages: vi.fn(),
};

const mockConversationsStore = {
  currentId: null as string | null,
  createConversation: vi.fn(),
};

vi.mock('@/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}));

vi.mock('@/stores/conversations', () => ({
  useConversationsStore: () => mockConversationsStore,
}));

describe('ChatArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatStore.messages = [];
    mockChatStore.isStreaming = false;
    mockConversationsStore.currentId = null;
  });

  describe('rendering', () => {
    it('should render with role="main"', () => {
      render(<ChatArea />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<ChatArea />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Chat area');
    });

    it('should render welcome message when no messages', () => {
      render(<ChatArea />);

      expect(screen.getByText('Welcome to TalkBox')).toBeInTheDocument();
    });

    it('should render chat input', () => {
      render(<ChatArea />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('loading messages', () => {
    it('should load messages when currentId changes', () => {
      mockConversationsStore.currentId = 'conv-1';
      render(<ChatArea />);

      expect(mockChatStore.loadMessages).toHaveBeenCalledWith('conv-1');
    });

    it('should clear messages when currentId becomes null', () => {
      mockConversationsStore.currentId = null;
      render(<ChatArea />);

      expect(mockChatStore.clearMessages).toHaveBeenCalled();
    });
  });

  describe('sending messages', () => {
    it('should create conversation if none exists and send message', async () => {
      mockConversationsStore.createConversation.mockResolvedValue('new-conv-id');

      render(<ChatArea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockConversationsStore.createConversation).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockChatStore.sendMessage).toHaveBeenCalledWith('new-conv-id', 'Hello');
      });
    });

    it('should send message to existing conversation', async () => {
      mockConversationsStore.currentId = 'existing-conv';

      render(<ChatArea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockChatStore.sendMessage).toHaveBeenCalledWith('existing-conv', 'Hello');
      });
    });
  });

  describe('streaming state', () => {
    it('should show stop button when streaming', () => {
      mockChatStore.isStreaming = true;

      render(<ChatArea />);

      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('should call stopStreaming when stop button clicked', () => {
      mockChatStore.isStreaming = true;

      render(<ChatArea />);

      const stopButton = screen.getByRole('button', { name: 'Stop' });
      fireEvent.click(stopButton);

      expect(mockChatStore.stopStreaming).toHaveBeenCalled();
    });
  });

  describe('with messages', () => {
    it('should render messages', () => {
      mockChatStore.messages = [
        { id: '1', role: 'user', content: 'Hello', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', role: 'assistant', content: 'Hi there!', createdAt: '2024-01-01T00:00:01.000Z' },
      ];

      render(<ChatArea />);

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });
});
