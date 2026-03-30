import type { Meta, StoryObj } from 'storybook/react-vite';
import { MermaidDiagram } from './MermaidDiagram';

const meta: Meta<typeof MermaidDiagram> = {
  title: 'Chat/MermaidDiagram',
  component: MermaidDiagram,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Flowchart: Story = {
  args: {
    chart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
  },
};

export const SequenceDiagram: Story = {
  args: {
    chart: `sequenceDiagram
    participant User
    participant App
    participant API
    participant DB

    User->>App: Send message
    App->>API: POST /chat
    API->>DB: Save message
    DB-->>API: Confirm
    API-->>App: Stream response
    App-->>User: Display message`,
  },
};

export const ClassDiagram: Story = {
  args: {
    chart: `classDiagram
    class User {
        +String id
        +String name
        +String email
        +login()
        +logout()
    }
    class Message {
        +String id
        +String content
        +String role
        +send()
    }
    class Conversation {
        +String id
        +String title
        +addMessage()
        +getMessages()
    }
    User "1" --> "*" Conversation
    Conversation "1" --> "*" Message`,
  },
};

export const StateDiagram: Story = {
  args: {
    chart: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : Send message
    Loading --> Streaming : Receive response
    Streaming --> Idle : Complete
    Streaming --> Error : Failure
    Error --> Idle : Retry
    Error --> [*] : Give up`,
  },
};

export const ERDiagram: Story = {
  args: {
    chart: `erDiagram
    USER ||--o{ CONVERSATION : has
    CONVERSATION ||--|{ MESSAGE : contains
    USER {
        string id PK
        string name
        string email
    }
    CONVERSATION {
        string id PK
        string title
        datetime created_at
    }
    MESSAGE {
        string id PK
        string content
        string role
        datetime created_at
    }`,
  },
};

export const PieChart: Story = {
  args: {
    chart: `pie title Language Distribution
    "TypeScript" : 45
    "JavaScript" : 25
    "CSS" : 15
    "HTML" : 10
    "Other" : 5`,
  },
};

export const GitGraph: Story = {
  args: {
    chart: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    checkout feature
    commit
    checkout main
    merge feature`,
  },
};

export const JourneyDiagram: Story = {
  args: {
    chart: `journey
    title User Onboarding Journey
    section Sign Up
      Visit website: 5: User
      Create account: 3: User
      Verify email: 4: User
    section First Chat
      Open app: 5: User
      Send message: 4: User
      Get response: 5: User, System
    section Explore
      Try features: 4: User
      Customize settings: 3: User`,
  },
};

export const InvalidDiagram: Story = {
  args: {
    chart: `this is not a valid mermaid diagram
    it should show an error`,
  },
};
