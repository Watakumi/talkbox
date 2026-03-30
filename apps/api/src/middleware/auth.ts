import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env.js';

// TODO: 本番環境では適切なOAuth認証を実装する
// 開発用のダミー認証
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  // 開発環境用: ダミーユーザー
  if (process.env.NODE_ENV === 'development') {
    c.set('user', {
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Development User',
      avatarUrl: null,
    });
    return next();
  }

  // 本番環境: Authorization ヘッダーからトークンを取得
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  // TODO: JWTトークンの検証とユーザー情報の取得を実装
  return c.json({ error: 'Not implemented', code: 'UNAUTHORIZED' }, 401);
});
