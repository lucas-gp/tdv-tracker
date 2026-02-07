-- Schema for TDV Tracker Postgres migration

CREATE TABLE IF NOT EXISTS sorties (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  creneau VARCHAR(20) NOT NULL,
  km DECIMAL(5,1) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS config (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert initial config
INSERT INTO config (key, value) VALUES 
  ('target_km', '250'),
  ('tdv_date', '2026-06-01'),
  ('class_name', 'CM1/CM2'),
  ('teacher', 'Sabrina')
ON CONFLICT (key) DO NOTHING;

-- Insert initial sorties
INSERT INTO sorties (id, date, creneau, km) VALUES
  (1, '2026-01-16', '13h00-16h30', NULL),
  (2, '2026-01-23', '13h00-16h30', NULL),
  (3, '2026-01-30', '13h00-16h30', NULL),
  (4, '2026-02-06', '13h00-16h30', NULL),
  (5, '2026-02-27', '8h20-16h30', NULL),
  (6, '2026-03-06', '8h20-16h30', NULL),
  (7, '2026-03-13', '8h20-16h30', NULL),
  (8, '2026-03-20', '8h20-16h30', NULL),
  (9, '2026-03-27', '8h20-16h30', NULL),
  (10, '2026-04-03', '8h20-16h30', NULL),
  (11, '2026-04-23', '13h00-16h30', NULL),
  (12, '2026-04-24', '8h20-16h30', NULL),
  (13, '2026-05-21', '13h00-16h30', NULL),
  (14, '2026-05-22', '8h20-16h30', NULL),
  (15, '2026-05-29', '8h20-16h30', NULL)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid conflicts with future inserts
SELECT setval('sorties_id_seq', (SELECT MAX(id) FROM sorties));
