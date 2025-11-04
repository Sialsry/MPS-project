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
  ssl: process.env.DB_SSL === 'false'
    ? false
    : { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });
export { pool };
export type DB = typeof db;
