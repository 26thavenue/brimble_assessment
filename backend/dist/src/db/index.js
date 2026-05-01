import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';
// Ensure the data directory exists
const dbPath = path.resolve(config.DATABASE_PATH);
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
// Initialize better-sqlite3
const sqlite = new Database(dbPath);
// Apply WAL mode for better concurrency and performance
sqlite.pragma('journal_mode = WAL');
// Initialize drizzle
export const db = drizzle(sqlite, { schema });
// Export a close function
export function closeDb() {
    sqlite.close();
}
