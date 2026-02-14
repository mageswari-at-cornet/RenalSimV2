import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the api directory explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('[DB] Connecting with DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 60) + '...');

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

export const db = drizzle(pool, { schema });
