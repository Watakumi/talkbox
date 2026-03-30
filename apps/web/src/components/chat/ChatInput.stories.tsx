import type { Meta, StoryObj } from 'storybook/react-vite';
import { fn } from 'storybook/test';
import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSend: fn(),
    onStop: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithMaxLength: Story = {
  args: {
    isLoading: false,
    maxLength: 100,
  },
};

export const ShortMaxLength: Story = {
  args: {
    isLoading: false,
    maxLength: 50,
  },
};
