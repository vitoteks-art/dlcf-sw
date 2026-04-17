ALTER TABLE biodata
  ADD COLUMN date_of_birth DATE NULL AFTER school,
  ADD COLUMN marital_status VARCHAR(30) NULL AFTER date_of_birth;
