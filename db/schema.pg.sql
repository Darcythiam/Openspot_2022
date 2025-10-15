-- PostgreSQL schema for OpenSpot (visitor pay lots)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- lots
CREATE TABLE IF NOT EXISTS lots (
  lot_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL
);

-- spaces: no "status" column; availability is derived from active sessions
CREATE TABLE IF NOT EXISTS spaces (
  space_id SERIAL PRIMARY KEY,
  lot_id INT NOT NULL REFERENCES lots(lot_id) ON DELETE CASCADE,
  space_number INT NOT NULL,                -- 1..53
  is_quick_15 BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (lot_id, space_number)
);

-- parking sessions: a paid interval that blocks the space until end_time
CREATE TABLE IF NOT EXISTS parking_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id INT NOT NULL REFERENCES spaces(space_id) ON DELETE CASCADE,
  plate VARCHAR(16) NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents >= 50 AND amount_cents % 50 = 0),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time   TIMESTAMPTZ NOT NULL
);

-- helpful index for "active" checks
CREATE INDEX IF NOT EXISTS idx_sessions_active ON parking_sessions (space_id, end_time)
  WHERE end_time > NOW();
