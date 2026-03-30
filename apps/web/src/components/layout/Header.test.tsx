import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

// Mock ResizeObserver for Headless UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'header.title': 'TalkBox',
        'header.toggleSidebar': 'Toggle sidebar',
        'header.changeLanguage': 'Change language',
        'header.export': 'Export',
        'header.exportJson': 'Export as JSON',
        'header.exportMarkdown': 'Export as Markdown',
        'header.newChat': 'New Chat',
        'settings.title': 'Settings',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('Header', () => {
  const defaultProps = {
    onMenuClick: vi.fn(),
    onNewChat: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with role="banner"', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('TalkBox')).toBeInTheDocument();
    });

    it('should render menu button with aria-label', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
    });

    it('should render new chat button', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'New Chat' })).toBeInTheDocument();
    });

    it('should render language menu button', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Change language' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onMenuClick when menu button clicked', () => {
      const onMenuClick = vi.fn();
      render(<Header {...defaultProps} onMenuClick={onMenuClick} />);

      fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('should call onNewChat when new chat button clicked', () => {
      const onNewChat = vi.fn();
      render(<Header {...defaultProps} onNewChat={onNewChat} />);

      fireEvent.click(screen.getByRole('button', { name: 'New Chat' }));

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });

    it('should change language to English when selected', async () => {
      render(<Header {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Change language' }));
      fireEvent.click(screen.getByText('English'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('should change language to Japanese when selected', async () => {
      render(<Header {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Change language' }));
      fireEvent.click(screen.getByText('日本語'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('ja');
    });
  });

  describe('settings button', () => {
    it('should not render settings button when onSettings is not provided', () => {
      render(<Header {...defaultProps} />);
      expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('should render settings button when onSettings is provided', () => {
      render(<Header {...defaultProps} onSettings={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });

    it('should call onSettings when settings button clicked', () => {
      const onSettings = vi.fn();
      render(<Header {...defaultProps} onSettings={onSettings} />);

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(onSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('export functionality', () => {
    it('should not render export button when canExport is false', () => {
      render(<Header {...defaultProps} canExport={false} onExport={vi.fn()} />);
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    });

    it('should not render export button when onExport is not provided', () => {
      render(<Header {...defaultProps} canExport={true} />);
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    });

    it('should render export button when both canExport and onExport are provided', () => {
      render(<Header {...defaultProps} canExport={true} onExport={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('should call onExport with json format', async () => {
      const onExport = vi.fn();
      render(<Header {...defaultProps} canExport={true} onExport={onExport} />);

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByText('Export as JSON'));

      expect(onExport).toHaveBeenCalledWith('json');
    });

    it('should call onExport with markdown format', async () => {
      const onExport = vi.fn();
      render(<Header {...defaultProps} canExport={true} onExport={onExport} />);

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByText('Export as Markdown'));

      expect(onExport).toHaveBeenCalledWith('markdown');
    });
  });
});
