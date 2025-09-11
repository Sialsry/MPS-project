// db 연결 객체
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
  // ssl: { rejectUnauthorized: false }, // 배포환경에서는 켜주기
  ssl: false, // 로컬 개발환경에서는 SSL 비활성화
});
export const db = drizzle(pool, { schema });
export { pool };
export type DB = typeof db;
