-- Seed SCSU visitor lots and spaces
INSERT INTO lots (name, address) VALUES
('4th Avenue Parking Ramp (Pay Lot)', '720 4th Ave S, St Cloud, MN 56301'),
('Eastman Pay Lot', '720 4th Ave S, St Cloud, MN 56301'),
('Husky Pay Lot', '720 4th Ave S, St Cloud, MN 56301'),
('ISELF Pay Lot', '720 4th Ave S, St Cloud, MN 56301'),
('Miller Pay Lot', '720 4th Ave S, St Cloud, MN 56301'),
('South Pay Lot', '720 4th Ave S, St Cloud, MN 56301')
ON CONFLICT (name) DO NOTHING;

-- For each lot, create 53 spaces: 1..50 normal, 51..53 quick-15
DO $$
DECLARE
  l RECORD;
  n INT;
BEGIN
  FOR l IN SELECT lot_id FROM lots LOOP
    FOR n IN 1..50 LOOP
      INSERT INTO spaces (lot_id, space_number, is_quick_15) VALUES (l.lot_id, n, FALSE)
      ON CONFLICT DO NOTHING;
    END LOOP;
    FOR n IN 51..53 LOOP
      INSERT INTO spaces (lot_id, space_number, is_quick_15) VALUES (l.lot_id, n, TRUE)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END$$;
