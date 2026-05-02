import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';
const dbPath = path.resolve(config.DATABASE_PATH);
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
export const db = drizzle(sqlite, { schema });
export function closeDb() {
    sqlite.close();
}
