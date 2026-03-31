import { config } from 'dotenv';
config({ path: '../../.env' });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { conversationsRoutes } from './routes/conversations.js';
import { chatRoutes } from './routes/chat.js';
import { mcpRoutes } from './routes/mcp.js';
import { authMiddleware } from './middleware/auth.js';
import type { Env } from './types/env.js';

const app = new Hono<Env>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// API routes
const api = new Hono<Env>();
api.use('*', authMiddleware);
api.route('/conversations', conversationsRoutes);
api.route('/chat', chatRoutes);
api.route('/mcp', mcpRoutes);

app.route('/api/v1', api);

// Start server
const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
