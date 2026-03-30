import type { Message, Conversation } from '@talkbox/shared';

export type ExportFormat = 'json' | 'markdown';

interface ExportData {
  conversation: Conversation;
  messages: Message[];
}

export function exportToJson(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToMarkdown(data: ExportData): string {
  const { conversation, messages } = data;
  const lines: string[] = [];

  lines.push(`# ${conversation.title || 'Untitled Conversation'}`);
  lines.push('');
  lines.push(`- Created: ${new Date(conversation.createdAt).toLocaleString()}`);
  lines.push(`- Updated: ${new Date(conversation.updatedAt).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const message of messages) {
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    const time = new Date(message.createdAt).toLocaleTimeString();

    lines.push(`## ${role} (${time})`);
    lines.push('');
    lines.push(message.content);
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportConversation(
  data: ExportData,
  format: ExportFormat
): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeTitle = (data.conversation.title || 'conversation')
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')
    .slice(0, 50);

  if (format === 'json') {
    const content = exportToJson(data);
    downloadFile(content, `${safeTitle}_${timestamp}.json`, 'application/json');
  } else {
    const content = exportToMarkdown(data);
    downloadFile(content, `${safeTitle}_${timestamp}.md`, 'text/markdown');
  }
}
