import type { Meta, StoryObj } from 'storybook/react-vite';
import { Message } from './Message';

const meta: Meta<typeof Message> = {
  title: 'Chat/Message',
  component: Message,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'Hello! Can you help me with a coding question?',
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content:
      "Of course! I'd be happy to help you with your coding question. What would you like to know?",
  },
};

export const WithMarkdown: Story = {
  args: {
    role: 'assistant',
    content: `Here's a quick overview:

## Features

- **Bold text** and *italic text*
- Lists and nested items
- [Links](https://example.com)

> This is a blockquote with some important information.

---

That's the basic formatting!`,
  },
};

export const WithCodeBlock: Story = {
  args: {
    role: 'assistant',
    content: `Here's a TypeScript example:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

You can also use inline code like \`const x = 1\`.`,
  },
};

export const WithTable: Story = {
  args: {
    role: 'assistant',
    content: `Here's a comparison table:

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Users | 5 | 50 | Unlimited |
| Storage | 1GB | 10GB | 100GB |
| Support | Email | Priority | Dedicated |

Choose the plan that fits your needs!`,
  },
};

export const WithMermaid: Story = {
  args: {
    role: 'assistant',
    content: `Here's a flowchart showing the process:

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

This diagram shows the debugging workflow.`,
  },
};

export const LongConversation: Story = {
  args: {
    role: 'assistant',
    content: `# Complete Guide to React Hooks

## Introduction

React Hooks were introduced in React 16.8 to allow you to use state and other React features without writing a class.

## useState

The \`useState\` hook lets you add state to functional components:

\`\`\`typescript
const [count, setCount] = useState(0);
\`\`\`

## useEffect

The \`useEffect\` hook lets you perform side effects:

\`\`\`typescript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Summary

| Hook | Purpose |
|------|---------|
| useState | Local state |
| useEffect | Side effects |
| useContext | Context consumption |
| useReducer | Complex state logic |

> **Pro tip**: Always include all dependencies in the dependency array!`,
  },
};
