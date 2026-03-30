import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore, LLM_MODELS } from './settings';

describe('settings store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useSettingsStore.setState({
      systemPrompt: '',
      model: 'gemini',
    });
  });

  describe('initial state', () => {
    it('should have empty system prompt by default', () => {
      const state = useSettingsStore.getState();
      expect(state.systemPrompt).toBe('');
    });

    it('should have gemini as default model', () => {
      const state = useSettingsStore.getState();
      expect(state.model).toBe('gemini');
    });
  });

  describe('setSystemPrompt', () => {
    it('should update system prompt', () => {
      const { setSystemPrompt } = useSettingsStore.getState();

      setSystemPrompt('You are a helpful assistant.');

      const state = useSettingsStore.getState();
      expect(state.systemPrompt).toBe('You are a helpful assistant.');
    });

    it('should allow empty system prompt', () => {
      const { setSystemPrompt } = useSettingsStore.getState();

      setSystemPrompt('Some prompt');
      setSystemPrompt('');

      const state = useSettingsStore.getState();
      expect(state.systemPrompt).toBe('');
    });
  });

  describe('setModel', () => {
    it('should update model to openai', () => {
      const { setModel } = useSettingsStore.getState();

      setModel('openai');

      const state = useSettingsStore.getState();
      expect(state.model).toBe('openai');
    });

    it('should update model to anthropic', () => {
      const { setModel } = useSettingsStore.getState();

      setModel('anthropic');

      const state = useSettingsStore.getState();
      expect(state.model).toBe('anthropic');
    });

    it('should update model back to gemini', () => {
      const { setModel } = useSettingsStore.getState();

      setModel('openai');
      setModel('gemini');

      const state = useSettingsStore.getState();
      expect(state.model).toBe('gemini');
    });
  });

  describe('LLM_MODELS', () => {
    it('should have three models', () => {
      expect(LLM_MODELS).toHaveLength(3);
    });

    it('should include gemini', () => {
      const gemini = LLM_MODELS.find((m) => m.id === 'gemini');
      expect(gemini).toBeDefined();
      expect(gemini?.name).toBe('Gemini');
    });

    it('should include openai', () => {
      const openai = LLM_MODELS.find((m) => m.id === 'openai');
      expect(openai).toBeDefined();
      expect(openai?.name).toContain('OpenAI');
    });

    it('should include anthropic', () => {
      const anthropic = LLM_MODELS.find((m) => m.id === 'anthropic');
      expect(anthropic).toBeDefined();
      expect(anthropic?.name).toBe('Claude');
    });
  });
});
