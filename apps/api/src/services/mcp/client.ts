import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { MCPServerConfig, ConnectedServer } from './types.js';

interface MCPConnection {
  client: Client;
  transport: StdioClientTransport;
  tools: Tool[];
  lastUsed: number;
}

// タイムアウト設定
const CONNECT_TIMEOUT_MS = 30000; // 30秒
const TOOL_CALL_TIMEOUT_MS = 60000; // 60秒
const IDLE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5分
const IDLE_THRESHOLD_MS = 10 * 60 * 1000; // 10分

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export class MCPClientManager {
  private connections: Map<string, MCPConnection> = new Map();
  private connectPromises: Map<string, Promise<ConnectedServer>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 定期的にアイドル状態のクライアントをクリーンアップ
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleClients().catch(console.error);
    }, IDLE_CLEANUP_INTERVAL_MS);
  }

  async connect(name: string, config: MCPServerConfig): Promise<ConnectedServer> {
    // 既に接続済みの場合
    if (this.connections.has(name)) {
      const existing = this.connections.get(name)!;
      existing.lastUsed = Date.now();
      return { name, tools: existing.tools };
    }

    // 接続中の場合は同じPromiseを返す（競合状態を防止）
    const existingPromise = this.connectPromises.get(name);
    if (existingPromise) {
      return existingPromise;
    }

    // 新規接続
    const connectPromise = this.doConnect(name, config);
    this.connectPromises.set(name, connectPromise);

    try {
      return await connectPromise;
    } finally {
      this.connectPromises.delete(name);
    }
  }

  private async doConnect(
    name: string,
    config: MCPServerConfig
  ): Promise<ConnectedServer> {
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: config.env,
    });

    const client = new Client({
      name: 'talkbox',
      version: '1.0.0',
    });

    try {
      await withTimeout(
        client.connect(transport),
        CONNECT_TIMEOUT_MS,
        `MCP connection to ${name}`
      );

      const toolsResult = await withTimeout(
        client.listTools(),
        CONNECT_TIMEOUT_MS,
        `List tools from ${name}`
      );
      const tools = toolsResult.tools;

      this.connections.set(name, {
        client,
        transport,
        tools,
        lastUsed: Date.now(),
      });

      return { name, tools };
    } catch (error) {
      // エラー時は必ずクリーンアップ
      await this.safeCloseTransport(transport);
      throw error;
    }
  }

  async connectAll(
    servers: Record<string, MCPServerConfig>
  ): Promise<ConnectedServer[]> {
    const results: ConnectedServer[] = [];

    for (const [name, config] of Object.entries(servers)) {
      try {
        const server = await this.connect(name, config);
        results.push(server);
      } catch (error) {
        console.error(`Failed to connect to MCP server "${name}":`, error);
      }
    }

    return results;
  }

  getAllTools(): Tool[] {
    const allTools: Tool[] = [];
    for (const connection of this.connections.values()) {
      allTools.push(...connection.tools);
    }
    return allTools;
  }

  findClientForTool(toolName: string): Client | null {
    for (const [, connection] of this.connections) {
      if (connection.tools.some((t) => t.name === toolName)) {
        connection.lastUsed = Date.now();
        return connection.client;
      }
    }
    return null;
  }

  async callTool(toolName: string, args: Record<string, unknown>) {
    const client = this.findClientForTool(toolName);
    if (!client) {
      throw new Error(`No MCP server found for tool: ${toolName}`);
    }

    return withTimeout(
      client.callTool({ name: toolName, arguments: args }),
      TOOL_CALL_TIMEOUT_MS,
      `Tool call ${toolName}`
    );
  }

  async disconnect(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (!connection) {
      return;
    }

    try {
      await connection.client.close();
    } catch (error) {
      console.warn(`Error closing MCP client "${name}":`, error);
    }

    await this.safeCloseTransport(connection.transport);
    this.connections.delete(name);
  }

  private async safeCloseTransport(
    transport: StdioClientTransport
  ): Promise<void> {
    try {
      await transport.close();
    } catch (error) {
      console.warn('Error closing transport:', error);
    }
  }

  async disconnectAll(): Promise<void> {
    const names = Array.from(this.connections.keys());
    await Promise.all(names.map((name) => this.disconnect(name)));
  }

  private async cleanupIdleClients(): Promise<void> {
    const now = Date.now();
    const names = Array.from(this.connections.keys());

    for (const name of names) {
      const connection = this.connections.get(name);
      if (connection && now - connection.lastUsed > IDLE_THRESHOLD_MS) {
        console.log(`Cleaning up idle MCP client: ${name}`);
        await this.disconnect(name);
      }
    }
  }

  getConnectedServers(): string[] {
    return Array.from(this.connections.keys());
  }

  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    await this.disconnectAll();
  }
}
