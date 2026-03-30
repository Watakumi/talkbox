import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMProviderType } from '@talkbox/shared';

export const LLM_MODELS: { id: LLMProviderType; name: string }[] = [
  { id: 'gemini', name: 'Gemini' },
  { id: 'openai', name: 'OpenAI (GPT-4o)' },
  { id: 'anthropic', name: 'Claude' },
];

interface SettingsState {
  systemPrompt: string;
  model: LLMProviderType;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: LLMProviderType) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      systemPrompt: '',
      model: 'gemini',
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setModel: (model) => set({ model }),
    }),
    {
      name: 'talkbox-settings',
    }
  )
);
