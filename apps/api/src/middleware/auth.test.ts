import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { authMiddleware } from './auth.js';
import type { Env } from '../types/env.js';

describe('authMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createTestApp() {
    const app = new Hono<Env>();
    app.use('*', authMiddleware);
    app.get('/test', (c) => {
      const user = c.get('user');
      return c.json({ user });
    });
    return app;
  }

  describe('development environment', () => {
    it('should set dummy user in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const app = createTestApp();

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.user).toEqual({
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        avatarUrl: null,
      });
    });
  });

  describe('production environment', () => {
    it('should return 401 when Authorization header is missing', async () => {
      process.env.NODE_ENV = 'production';
      const app = createTestApp();

      const res = await app.request('/test');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when Authorization header does not start with Bearer', async () => {
      process.env.NODE_ENV = 'production';
      const app = createTestApp();

      const res = await app.request('/test', {
        headers: { Authorization: 'Basic abc123' },
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for Bearer token (not implemented)', async () => {
      process.env.NODE_ENV = 'production';
      const app = createTestApp();

      const res = await app.request('/test', {
        headers: { Authorization: 'Bearer valid-token' },
      });

      // Currently returns 401 as JWT validation is not implemented
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Not implemented');
    });
  });
});
