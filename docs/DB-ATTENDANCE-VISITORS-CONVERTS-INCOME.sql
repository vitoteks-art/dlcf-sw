ALTER TABLE attendance_entries
  ADD COLUMN visitors INT NOT NULL DEFAULT 0 AFTER entry_date,
  ADD COLUMN converts INT NOT NULL DEFAULT 0 AFTER visitors,
  ADD COLUMN tithe_and_offering DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER converts;
