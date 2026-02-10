ALTER TABLE zonal_congress_registrations
  ADD COLUMN title VARCHAR(20) NOT NULL DEFAULT 'Mr.',
  ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT 'Male',
  ADD COLUMN membership_status VARCHAR(40) NOT NULL DEFAULT 'Member',
  ADD COLUMN registration_date DATE NULL,
  ADD COLUMN institution VARCHAR(200) NOT NULL DEFAULT '';

CREATE TABLE zonal_congress_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
