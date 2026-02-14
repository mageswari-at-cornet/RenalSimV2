import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not defined');
        process.exit(1);
    }

    // Connect to 'postgres' database to create the new database
    const postgresUrl = dbUrl.replace(/\/[^/]+$/, '/postgres');

    console.log(`Connecting to ${postgresUrl} to check/create database...`);
    const client = new Client({ connectionString: postgresUrl });

    try {
        await client.connect();

        const dbName = 'renalsim';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            // CREATE DATABASE cannot be executed in a transaction block, and parameters are not supported for identifiers
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
