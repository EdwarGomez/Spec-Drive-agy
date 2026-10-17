PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO courts (id, name) VALUES
  (1, 'Cancha Laureles'),
  (2, 'Cancha El Poblado'),
  (3, 'Cancha Belén'),
  (4, 'Cancha Robledo'),
  (5, 'Cancha Envigado');

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  court_id INTEGER NOT NULL REFERENCES courts(id),
  booking_date TEXT NOT NULL,
  start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL CHECK (end_hour = start_hour + 1),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_slot
ON bookings (court_id, booking_date, start_hour)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_bookings_user_status
ON bookings (user_id, status, booking_date, end_hour);
