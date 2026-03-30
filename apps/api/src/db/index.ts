import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

let _db: MySql2Database<typeof schema> | null = null;

export async function getDb() {
  if (!_db) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    _db = drizzle(connection, { schema, mode: 'default' });
  }
  return _db;
}

export * from './schema.js';
