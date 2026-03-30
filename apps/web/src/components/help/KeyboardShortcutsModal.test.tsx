import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

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
        'shortcuts.title': 'Keyboard Shortcuts',
        'shortcuts.newChat': 'New chat',
        'shortcuts.search': 'Search conversations',
        'shortcuts.toggleSidebar': 'Toggle sidebar',
        'shortcuts.settings': 'Settings',
        'shortcuts.showHelp': 'Show keyboard shortcuts',
        'common.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

describe('KeyboardShortcutsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('shortcuts display', () => {
    it('should display new chat shortcut', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('New chat')).toBeInTheDocument();
      expect(screen.getByText('N')).toBeInTheDocument();
    });

    it('should display search shortcut', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('Search conversations')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should display toggle sidebar shortcut', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should display settings shortcut', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText(',')).toBeInTheDocument();
    });

    it('should display help shortcut', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('should display modifier key (Ctrl or ⌘)', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      // Should have either ⌘ (Mac) or Ctrl (other)
      const modKeyElements = screen.getAllByText(/⌘|Ctrl/);
      expect(modKeyElements.length).toBeGreaterThan(0);
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<KeyboardShortcutsModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should use kbd elements for shortcut keys', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);
      const kbdElements = document.querySelectorAll('kbd');
      expect(kbdElements.length).toBeGreaterThan(0);
    });
  });
});
