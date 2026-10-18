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

  const existingBookingsTable = database
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'bookings'")
    .get() as { sql?: string } | undefined;

  if (
    existingBookingsTable?.sql &&
    !existingBookingsTable.sql.includes('start_hour >= 7 AND start_hour <= 21')
  ) {
    database.exec(`
      BEGIN IMMEDIATE;
      DELETE FROM bookings WHERE start_hour < 7 OR start_hour > 21;
      ALTER TABLE bookings RENAME TO bookings_legacy;
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        court_id INTEGER NOT NULL REFERENCES courts(id),
        booking_date TEXT NOT NULL,
        start_hour INTEGER NOT NULL CHECK (start_hour >= 7 AND start_hour <= 21),
        end_hour INTEGER NOT NULL CHECK (end_hour = start_hour + 1 AND end_hour <= 22),
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO bookings (id, user_id, court_id, booking_date, start_hour, end_hour, status, created_at)
      SELECT id, user_id, court_id, booking_date, start_hour, end_hour, status, created_at FROM bookings_legacy;
      DROP TABLE bookings_legacy;
      COMMIT;
    `);
  }

  const schemaSql = fs.readFileSync(schemaFilePath, 'utf-8');
  database.exec(schemaSql);
}

initializeDatabase(db);
