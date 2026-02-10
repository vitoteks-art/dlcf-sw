CREATE TABLE state_congress_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(20) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  category VARCHAR(40) NOT NULL,
  membership_status VARCHAR(40) NOT NULL,
  cluster VARCHAR(120) NOT NULL,
  registration_date DATE NOT NULL,
  state VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  fellowship_centre VARCHAR(200) NOT NULL,
  registration_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX state_congress_date_idx (registration_date),
  INDEX state_congress_email_idx (email),
  INDEX state_congress_phone_idx (phone),
  INDEX state_congress_state_idx (state),
  INDEX state_congress_region_idx (region)
);

CREATE TABLE state_congress_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
