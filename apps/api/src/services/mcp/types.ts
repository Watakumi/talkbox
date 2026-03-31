import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface ConnectedServer {
  name: string;
  tools: Tool[];
}
