import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';

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
        'settings.title': 'Settings',
        'settings.model': 'AI Model',
        'settings.modelHint': 'Select the AI model to use',
        'settings.systemPrompt': 'System Prompt',
        'settings.systemPromptPlaceholder': 'Enter system prompt...',
        'settings.systemPromptHint': 'Instructions for the AI',
        'settings.save': 'Save',
        'settings.reset': 'Reset',
        'common.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

const mockSettingsStore = {
  systemPrompt: 'Test prompt',
  setSystemPrompt: vi.fn(),
  model: 'gemini' as const,
  setModel: vi.fn(),
};

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => mockSettingsStore,
  LLM_MODELS: [
    { id: 'gemini', name: 'Gemini' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Claude' },
  ],
}));

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsStore.systemPrompt = 'Test prompt';
    mockSettingsStore.model = 'gemini';
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<SettingsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render model select', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByLabelText('AI Model')).toBeInTheDocument();
    });

    it('should render system prompt textarea', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByLabelText('System Prompt')).toBeInTheDocument();
    });

    it('should render save and reset buttons', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('initial values', () => {
    it('should display current system prompt', () => {
      render(<SettingsModal {...defaultProps} />);
      const textarea = screen.getByLabelText('System Prompt');
      expect(textarea).toHaveValue('Test prompt');
    });

    it('should display current model selection', () => {
      render(<SettingsModal {...defaultProps} />);
      const select = screen.getByLabelText('AI Model');
      expect(select).toHaveValue('gemini');
    });
  });

  describe('model selection', () => {
    it('should render all model options', () => {
      render(<SettingsModal {...defaultProps} />);
      const select = screen.getByLabelText('AI Model');

      expect(select).toContainHTML('Gemini');
      expect(select).toContainHTML('OpenAI');
      expect(select).toContainHTML('Claude');
    });

    it('should update model on change', () => {
      render(<SettingsModal {...defaultProps} />);
      const select = screen.getByLabelText('AI Model');

      fireEvent.change(select, { target: { value: 'openai' } });

      expect(select).toHaveValue('openai');
    });
  });

  describe('system prompt editing', () => {
    it('should update textarea on input', () => {
      render(<SettingsModal {...defaultProps} />);
      const textarea = screen.getByLabelText('System Prompt');

      fireEvent.change(textarea, { target: { value: 'New prompt' } });

      expect(textarea).toHaveValue('New prompt');
    });
  });

  describe('save functionality', () => {
    it('should call setSystemPrompt and setModel on save', () => {
      render(<SettingsModal {...defaultProps} />);

      const textarea = screen.getByLabelText('System Prompt');
      fireEvent.change(textarea, { target: { value: 'Updated prompt' } });

      const select = screen.getByLabelText('AI Model');
      fireEvent.change(select, { target: { value: 'openai' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockSettingsStore.setSystemPrompt).toHaveBeenCalledWith('Updated prompt');
      expect(mockSettingsStore.setModel).toHaveBeenCalledWith('openai');
    });

    it('should call onClose after save', () => {
      const onClose = vi.fn();
      render(<SettingsModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('reset functionality', () => {
    it('should reset prompt to empty and model to gemini', () => {
      render(<SettingsModal {...defaultProps} />);

      const textarea = screen.getByLabelText('System Prompt');
      fireEvent.change(textarea, { target: { value: 'Some text' } });

      const select = screen.getByLabelText('AI Model');
      fireEvent.change(select, { target: { value: 'openai' } });

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      expect(textarea).toHaveValue('');
      expect(select).toHaveValue('gemini');
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<SettingsModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalled();
    });
  });
});
