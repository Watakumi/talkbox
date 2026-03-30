import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'chat.placeholder': 'Type a message...',
        'chat.send': 'Send',
        'chat.stop': 'Stop',
        'chat.characterLimit': `${params?.current}/${params?.max} characters`,
      };
      return translations[key] || key;
    },
  }),
}));

describe('ChatInput', () => {
  const defaultProps = {
    onSend: vi.fn(),
    onStop: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render textarea with placeholder', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    it('should render send button when not loading', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });

    it('should render stop button when loading', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('should have accessible label for textarea', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAccessibleName('Type a message...');
    });
  });

  describe('input behavior', () => {
    it('should update value when typing', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(textarea).toHaveValue('Hello');
    });

    it('should be disabled when loading', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('submit behavior', () => {
    it('should call onSend with trimmed message on submit', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  Hello World  ');

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      expect(onSend).toHaveBeenCalledWith('Hello World');
    });

    it('should clear input after sending', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      expect(textarea).toHaveValue('');
    });

    it('should not call onSend with empty message', async () => {
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend with whitespace-only message', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend when loading', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} isLoading={true} />);

      // Type before loading state
      const textarea = screen.getByRole('textbox');
      // Textarea is disabled when loading, so we set value directly
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      const form = textarea.closest('form')!;
      fireEvent.submit(form);

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('keyboard behavior', () => {
    it('should submit on Enter key', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello{Enter}');

      expect(onSend).toHaveBeenCalledWith('Hello');
    });

    it('should not submit on Shift+Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}');

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('character limit', () => {
    it('should show error when over character limit', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} maxLength={10} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is too long');

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('16/10 characters')).toBeInTheDocument();
    });

    it('should mark textarea as invalid when over limit', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} maxLength={5} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Too long');

      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should disable submit when over limit', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} maxLength={5} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Too long');

      expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    });
  });

  describe('stop button', () => {
    it('should call onStop when stop button clicked', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      render(<ChatInput {...defaultProps} onStop={onStop} isLoading={true} />);

      await user.click(screen.getByRole('button', { name: 'Stop' }));

      expect(onStop).toHaveBeenCalled();
    });
  });
});
