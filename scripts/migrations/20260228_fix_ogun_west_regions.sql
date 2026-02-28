-- Fix Ogun State (West) regions list
-- Expected regions: Ota, Itele, Lusada, Ipokia, Yewa, Ilogbo, Ijoko, Agbado

-- Remove wrong region if present
DELETE FROM regions
WHERE state_name = 'Ogun State (West)'
  AND name = 'Remo';

-- Add missing regions (idempotent)
INSERT IGNORE INTO regions (state_name, name, created_at, updated_at) VALUES
  ('Ogun State (West)', 'Ota', NOW(), NOW()),
  ('Ogun State (West)', 'Itele', NOW(), NOW()),
  ('Ogun State (West)', 'Lusada', NOW(), NOW()),
  ('Ogun State (West)', 'Ipokia', NOW(), NOW()),
  ('Ogun State (West)', 'Yewa', NOW(), NOW()),
  ('Ogun State (West)', 'Ilogbo', NOW(), NOW()),
  ('Ogun State (West)', 'Ijoko', NOW(), NOW()),
  ('Ogun State (West)', 'Agbado', NOW(), NOW());
