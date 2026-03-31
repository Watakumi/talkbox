import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { MCPClientManager, type MCPServerConfig } from '../services/mcp/index.js';
import type { Env } from '../types/env.js';

// シングルトンのMCPClientManager（アプリ全体で共有）
let mcpManager: MCPClientManager | null = null;

export function getMCPManager(): MCPClientManager {
  if (!mcpManager) {
    mcpManager = new MCPClientManager();
  }
  return mcpManager;
}

// グレースフルシャットダウン用
export async function shutdownMCPManager(): Promise<void> {
  if (mcpManager) {
    await mcpManager.shutdown();
    mcpManager = null;
  }
}

// 入力検証スキーマ
const connectSchema = z.object({
  name: z.string().min(1).max(100),
  command: z.string().min(1).max(500),
  args: z.array(z.string().max(1000)).max(20).optional(),
  env: z.record(z.string().max(10000)).optional(),
});

const disconnectSchema = z.object({
  name: z.string().min(1).max(100),
});

const callToolSchema = z.object({
  name: z.string().min(1).max(200),
  arguments: z.record(z.unknown()).optional(),
});

// エラーレスポンス生成（本番環境では詳細を隠す）
function createErrorResponse(
  message: string,
  error: unknown
): { error: string; details?: string } {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    error: message,
    ...(isDevelopment && {
      details: error instanceof Error ? error.message : 'Unknown error',
    }),
  };
}

export const mcpRoutes = new Hono<Env>()
  // MCP サーバーに接続
  .post('/connect', zValidator('json', connectSchema), async (c) => {
    const config = c.req.valid('json') as MCPServerConfig;
    const manager = getMCPManager();

    try {
      const server = await manager.connect(config.name, config);
      return c.json({
        success: true,
        server: {
          name: server.name,
          tools: server.tools.map((t) => ({
            name: t.name,
            description: t.description,
          })),
        },
      });
    } catch (error) {
      console.error('MCP connection error:', error);
      return c.json(
        {
          success: false,
          ...createErrorResponse('Failed to connect to MCP server', error),
        },
        500
      );
    }
  })

  // MCP サーバーから切断
  .post('/disconnect', zValidator('json', disconnectSchema), async (c) => {
    const { name } = c.req.valid('json');
    const manager = getMCPManager();

    try {
      await manager.disconnect(name);
      return c.json({ success: true });
    } catch (error) {
      console.error('MCP disconnect error:', error);
      return c.json(
        {
          success: false,
          ...createErrorResponse('Failed to disconnect', error),
        },
        500
      );
    }
  })

  // 接続中のサーバー一覧
  .get('/servers', (c) => {
    const manager = getMCPManager();
    const servers = manager.getConnectedServers();
    return c.json({ servers });
  })

  // 利用可能なツール一覧
  .get('/tools', (c) => {
    const manager = getMCPManager();
    const tools = manager.getAllTools();
    return c.json({
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    });
  })

  // ツールを実行
  .post('/call', zValidator('json', callToolSchema), async (c) => {
    const { name, arguments: args } = c.req.valid('json');
    const manager = getMCPManager();

    try {
      const result = await manager.callTool(name, args || {});
      return c.json({ success: true, result });
    } catch (error) {
      console.error('MCP tool call error:', error);
      return c.json(
        {
          success: false,
          ...createErrorResponse('Tool call failed', error),
        },
        500
      );
    }
  });
