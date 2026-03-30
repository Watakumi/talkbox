import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportToJson,
  exportToMarkdown,
  downloadFile,
  exportConversation,
} from './export';
import type { Conversation, Message } from '@talkbox/shared';

describe('export utilities', () => {
  const mockConversation: Conversation = {
    id: '123',
    title: 'Test Conversation',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
  };

  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      createdAt: '2024-01-01T10:00:00.000Z',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      createdAt: '2024-01-01T10:00:01.000Z',
    },
  ];

  describe('exportToJson', () => {
    it('should export conversation and messages as JSON string', () => {
      const result = exportToJson({
        conversation: mockConversation,
        messages: mockMessages,
      });

      const parsed = JSON.parse(result);
      expect(parsed.conversation.id).toBe('123');
      expect(parsed.conversation.title).toBe('Test Conversation');
      expect(parsed.messages).toHaveLength(2);
      expect(parsed.messages[0].content).toBe('Hello');
      expect(parsed.messages[1].content).toBe('Hi there!');
    });

    it('should format JSON with indentation', () => {
      const result = exportToJson({
        conversation: mockConversation,
        messages: mockMessages,
      });

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('exportToMarkdown', () => {
    it('should export conversation as markdown with title', () => {
      const result = exportToMarkdown({
        conversation: mockConversation,
        messages: mockMessages,
      });

      expect(result).toContain('# Test Conversation');
    });

    it('should include creation and update dates', () => {
      const result = exportToMarkdown({
        conversation: mockConversation,
        messages: mockMessages,
      });

      expect(result).toContain('Created:');
      expect(result).toContain('Updated:');
    });

    it('should include user messages with emoji', () => {
      const result = exportToMarkdown({
        conversation: mockConversation,
        messages: mockMessages,
      });

      expect(result).toContain('👤 User');
      expect(result).toContain('Hello');
    });

    it('should include assistant messages with emoji', () => {
      const result = exportToMarkdown({
        conversation: mockConversation,
        messages: mockMessages,
      });

      expect(result).toContain('🤖 Assistant');
      expect(result).toContain('Hi there!');
    });

    it('should handle untitled conversations', () => {
      const untitledConversation = { ...mockConversation, title: '' };
      const result = exportToMarkdown({
        conversation: untitledConversation,
        messages: mockMessages,
      });

      expect(result).toContain('# Untitled Conversation');
    });
  });

  describe('downloadFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create and click a download link', () => {
      const clickMock = vi.fn();
      const appendChildMock = vi.fn();
      const removeChildMock = vi.fn();

      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickMock,
      } as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock);
      vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock);

      downloadFile('test content', 'test.txt', 'text/plain');

      expect(clickMock).toHaveBeenCalled();
      expect(appendChildMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportConversation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
      vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
    });

    it('should export as JSON with correct filename', () => {
      const data = {
        conversation: mockConversation,
        messages: mockMessages,
      };

      exportConversation(data, 'json');

      const link = document.createElement('a') as HTMLAnchorElement;
      expect(link.download).toContain('.json');
    });

    it('should export as Markdown with correct filename', () => {
      const data = {
        conversation: mockConversation,
        messages: mockMessages,
      };

      exportConversation(data, 'markdown');

      const link = document.createElement('a') as HTMLAnchorElement;
      expect(link.download).toContain('.md');
    });

    it('should sanitize special characters in filename', () => {
      const specialConversation = {
        ...mockConversation,
        title: 'Test/Conv:Name?',
      };

      exportConversation(
        { conversation: specialConversation, messages: mockMessages },
        'json'
      );

      // The title should be sanitized (special chars replaced with _)
      const link = document.createElement('a') as HTMLAnchorElement;
      expect(link.download).not.toContain('/');
      expect(link.download).not.toContain(':');
      expect(link.download).not.toContain('?');
    });
  });
});
