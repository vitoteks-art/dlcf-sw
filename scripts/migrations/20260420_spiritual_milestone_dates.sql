ALTER TABLE biodata
  ADD COLUMN new_birth_date DATE NULL AFTER new_birth_status,
  ADD COLUMN sanctification_date DATE NULL AFTER sanctification_status,
  ADD COLUMN holy_ghost_baptism_date DATE NULL AFTER holy_ghost_baptism_status;
