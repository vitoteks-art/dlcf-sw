ALTER TABLE fellowship_centres
  ADD COLUMN address VARCHAR(255) NULL AFTER region,
  ADD COLUMN description TEXT NULL AFTER address;
