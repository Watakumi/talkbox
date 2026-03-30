import type { Meta, StoryObj } from 'storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Common/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const WithCustomColor: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="text-blue-500" />
      <Spinner className="text-green-500" />
      <Spinner className="text-red-500" />
      <Spinner className="text-purple-500" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white">
      <Spinner size="sm" />
      Loading...
    </button>
  ),
};
