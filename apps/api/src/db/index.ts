import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
