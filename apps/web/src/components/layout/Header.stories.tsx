import type { Meta, StoryObj } from 'storybook/react-vite';
import { fn } from 'storybook/test';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onMenuClick: fn(),
    onNewChat: fn(),
    onExport: fn(),
    onSettings: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    canExport: false,
  },
};

export const WithExport: Story = {
  args: {
    canExport: true,
  },
};

export const WithSettings: Story = {
  args: {
    canExport: true,
    onSettings: fn(),
  },
};

export const MinimalMobile: Story = {
  args: {
    canExport: false,
    onSettings: undefined,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
