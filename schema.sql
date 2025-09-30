-- OpenSpot_2022 schema
-- Keep it readable; add only the constraints we actually need.

-- Drop & create database for clean local dev
DROP DATABASE IF EXISTS openspot_2022;
CREATE DATABASE openspot_2022
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE openspot_2022;

-- Users
CREATE TABLE users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  role        ENUM('admin','attendant') NOT NULL DEFAULT 'attendant',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Lots
CREATE TABLE lots (
  lot_id     INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  address    VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_lot_name (name)
) ENGINE=InnoDB;

-- Spaces
CREATE TABLE spaces (
  space_id      INT AUTO_INCREMENT PRIMARY KEY,
  lot_id        INT NOT NULL,
  label         VARCHAR(20) NOT NULL,  -- e.g., "A-12"
  is_accessible TINYINT(1) NOT NULL DEFAULT 0,
  is_reserved   TINYINT(1) NOT NULL DEFAULT 0,
  status        ENUM('open','occupied','blocked') NOT NULL DEFAULT 'open',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spaces_lot FOREIGN KEY (lot_id) REFERENCES lots(lot_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_space_per_lot (lot_id, label),
  KEY idx_spaces_lot_status (lot_id, status)
) ENGINE=InnoDB;

-- Occupancy events (append-only)
CREATE TABLE occupancy_events (
  event_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
  space_id    INT NOT NULL,
  event_type  ENUM('enter','exit','block','unblock') NOT NULL,
  ts          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  plate       VARCHAR(16) NULL,
  CONSTRAINT fk_events_space FOREIGN KEY (space_id) REFERENCES spaces(space_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_events_space_ts (space_id, ts),
  KEY idx_events_type_ts (event_type, ts)
) ENGINE=InnoDB;

-- Permits (simple)
CREATE TABLE permits (
  permit_id  INT AUTO_INCREMENT PRIMARY KEY,
  plate      VARCHAR(16) NOT NULL,
  type       ENUM('student','staff','visitor') NOT NULL,
  expires_on DATE NOT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uniq_active_plate (plate, is_active)
) ENGINE=InnoDB;

-- Violations
CREATE TABLE violations (
  violation_id INT AUTO_INCREMENT PRIMARY KEY,
  space_id     INT NOT NULL,
  plate        VARCHAR(16) NOT NULL,
  reason       VARCHAR(255) NOT NULL,
  ts           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved     TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_viol_space FOREIGN KEY (space_id) REFERENCES spaces(space_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_viol_resolved_ts (resolved, ts)
) ENGINE=InnoDB;
