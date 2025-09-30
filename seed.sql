USE openspot_2022;

-- Users
INSERT INTO users (email, role) VALUES
('admin@openspot.local', 'admin'),
('attendant@openspot.local', 'attendant');

-- Lots
INSERT INTO lots (name, address) VALUES
('North Lot', '1000 College Ave'),
('East Garage', '25 Maple St');

-- Spaces (North Lot: A-01..A-10)
INSERT INTO spaces (lot_id, label, is_accessible, is_reserved, status) VALUES
(1, 'A-01', 0, 0, 'open'),
(1, 'A-02', 0, 0, 'open'),
(1, 'A-03', 0, 1, 'open'),
(1, 'A-04', 1, 0, 'open'),
(1, 'A-05', 0, 0, 'occupied'),
(1, 'A-06', 0, 0, 'open'),
(1, 'A-07', 0, 0, 'blocked'),
(1, 'A-08', 0, 0, 'open'),
(1, 'A-09', 0, 1, 'open'),
(1, 'A-10', 0, 0, 'open');

-- Spaces (East Garage: E-01..E-06)
INSERT INTO spaces (lot_id, label, is_accessible, is_reserved, status) VALUES
(2, 'E-01', 0, 0, 'open'),
(2, 'E-02', 0, 0, 'occupied'),
(2, 'E-03', 1, 0, 'open'),
(2, 'E-04', 0, 1, 'open'),
(2, 'E-05', 0, 0, 'open'),
(2, 'E-06', 0, 0, 'blocked');

-- Some historical events
INSERT INTO occupancy_events (space_id, event_type, ts, plate) VALUES
(5, 'enter',  NOW() - INTERVAL 50 MINUTE, 'SCSU123'),
(5, 'exit',   NOW() - INTERVAL 10 MINUTE, 'SCSU123'),
(7, 'block',  NOW() - INTERVAL 2 HOUR, NULL),
(12, 'enter', NOW() - INTERVAL 30 MINUTE, 'MN7ABC');

-- A couple permits
INSERT INTO permits (plate, type, expires_on, is_active) VALUES
('SCSU123', 'student', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 1),
('MN7ABC', 'visitor', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1);

-- A sample violation
INSERT INTO violations (space_id, plate, reason, ts, resolved) VALUES
(5, 'NO-PERMIT', 'Parked in reserved without permit', NOW() - INTERVAL 1 DAY, 0);
