import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type Database from 'better-sqlite3';

const backendRequire = createRequire(path.resolve(__dirname, '../backend/package.json'));
const BetterSqlite3 = backendRequire('better-sqlite3') as typeof Database;

const dbFilePath = process.env.PADEL_DB_PATH
  ? path.resolve(process.env.PADEL_DB_PATH)
  : path.resolve(__dirname, 'padel.db');

const schemaFilePath = path.resolve(__dirname, 'schema.sql');

export const db: Database.Database = new BetterSqlite3(dbFilePath);

export function initializeDatabase(database: Database.Database = db): void {
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  const schemaSql = fs.readFileSync(schemaFilePath, 'utf-8');
  database.exec(schemaSql);
}

initializeDatabase(db);
