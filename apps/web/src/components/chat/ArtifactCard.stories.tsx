import type { Meta, StoryObj } from 'storybook/react-vite';
import { ArtifactCard } from './ArtifactCard';

const meta: Meta<typeof ArtifactCard> = {
  title: 'Chat/ArtifactCard',
  component: ArtifactCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CodeArtifact: Story = {
  args: {
    type: 'code',
    title: 'TypeScript Example',
    children: (
      <pre className="text-sm">
        {`interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`}
      </pre>
    ),
  },
};

export const DocumentArtifact: Story = {
  args: {
    type: 'document',
    title: 'Project Overview',
    children: (
      <div className="prose prose-sm">
        <p>
          This is a document artifact that can contain rich text content including
          paragraphs, lists, and other formatted text.
        </p>
        <ul>
          <li>Feature 1: User authentication</li>
          <li>Feature 2: Real-time messaging</li>
          <li>Feature 3: File sharing</li>
        </ul>
      </div>
    ),
  },
};

export const TableArtifact: Story = {
  args: {
    type: 'table',
    title: 'User Statistics',
    children: (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">Alice</td>
            <td className="px-4 py-2">Admin</td>
            <td className="px-4 py-2">Active</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">Bob</td>
            <td className="px-4 py-2">User</td>
            <td className="px-4 py-2">Active</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Charlie</td>
            <td className="px-4 py-2">User</td>
            <td className="px-4 py-2">Inactive</td>
          </tr>
        </tbody>
      </table>
    ),
  },
};

export const ChartArtifact: Story = {
  args: {
    type: 'chart',
    title: 'Monthly Revenue',
    children: (
      <div className="flex h-32 items-end gap-2">
        <div className="w-12 bg-orange-400" style={{ height: '40%' }} title="Jan: $4,000" />
        <div className="w-12 bg-orange-400" style={{ height: '60%' }} title="Feb: $6,000" />
        <div className="w-12 bg-orange-400" style={{ height: '55%' }} title="Mar: $5,500" />
        <div className="w-12 bg-orange-400" style={{ height: '80%' }} title="Apr: $8,000" />
        <div className="w-12 bg-orange-400" style={{ height: '100%' }} title="May: $10,000" />
      </div>
    ),
  },
};

export const SummaryArtifact: Story = {
  args: {
    type: 'summary',
    title: 'Key Takeaways',
    children: (
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>Performance improved by 25%</li>
        <li>User engagement up 40%</li>
        <li>Bug reports down 60%</li>
        <li>Customer satisfaction at 95%</li>
      </ul>
    ),
  },
};

export const Collapsible: Story = {
  args: {
    type: 'code',
    title: 'Collapsible Code Block',
    collapsible: true,
    defaultExpanded: true,
    children: (
      <pre className="text-sm">
        {`const greeting = "Hello, World!";
console.log(greeting);`}
      </pre>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    type: 'document',
    title: 'Click to Expand',
    collapsible: true,
    defaultExpanded: false,
    children: (
      <p className="text-sm">
        This content is hidden by default. Click the expand button to see it.
      </p>
    ),
  },
};

export const WithCopyButton: Story = {
  args: {
    type: 'code',
    title: 'Copyable Code',
    copyable: true,
    copyContent: `npm install @talkbox/web`,
    children: (
      <pre className="text-sm">npm install @talkbox/web</pre>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    type: 'code',
    title: 'Installation Script',
    collapsible: true,
    defaultExpanded: true,
    copyable: true,
    copyContent: `#!/bin/bash
git clone https://github.com/example/talkbox.git
cd talkbox
pnpm install
pnpm dev`,
    children: (
      <pre className="text-sm text-gray-800">
        {`#!/bin/bash
git clone https://github.com/example/talkbox.git
cd talkbox
pnpm install
pnpm dev`}
      </pre>
    ),
  },
};
