import 'dotenv/config';
import { Pool } from 'pg';
import * as schema from './schema';
declare const pool: any;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("drizzle-orm/node-postgres").NodePgClient extends TClient ? Pool : TClient;
};
export { pool };
export type DB = typeof db;
