CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL,
  verification_code VARCHAR(120) DEFAULT NULL,
  verification_expires_at DATETIME DEFAULT NULL,
  email_verified_at DATETIME DEFAULT NULL,
  reset_token VARCHAR(120) DEFAULT NULL,
  reset_expires_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_name VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY unique_region (state_name, name)
);

CREATE TABLE institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_name VARCHAR(120) NOT NULL,
  name VARCHAR(190) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY unique_institution (state_name, name)
);

CREATE TABLE work_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE fellowship_centres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  state VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY unique_centre (name, state, region)
);

CREATE TABLE attendance_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fellowship_centre_id INT NOT NULL,
  service_day VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (fellowship_centre_id) REFERENCES fellowship_centres(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE attendance_counts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_entry_id INT NOT NULL,
  category VARCHAR(20) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  count INT NOT NULL DEFAULT 0,
  FOREIGN KEY (attendance_entry_id) REFERENCES attendance_entries(id)
);

CREATE TABLE retreat_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  retreat_type VARCHAR(30) NOT NULL,
  title VARCHAR(20) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  category VARCHAR(40) NOT NULL,
  membership_status VARCHAR(40) NOT NULL,
  cluster VARCHAR(120) NOT NULL,
  dlcf_center VARCHAR(200) NOT NULL,
  registration_date DATE NOT NULL,
  registration_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX retreat_date_idx (registration_date),
  INDEX retreat_email_idx (email),
  INDEX retreat_phone_idx (phone)
);

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

CREATE TABLE zonal_congress_registrations (
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
  institution VARCHAR(200) NOT NULL,
  fellowship_centre VARCHAR(200) NOT NULL,
  registration_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX zonal_date_idx (registration_date),
  INDEX zonal_email_idx (email),
  INDEX zonal_phone_idx (phone),
  INDEX zonal_state_idx (state),
  INDEX zonal_region_idx (region)
);

CREATE TABLE zonal_congress_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE media_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  speaker VARCHAR(120) DEFAULT NULL,
  series VARCHAR(120) DEFAULT NULL,
  media_type VARCHAR(20) NOT NULL,
  source_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  duration_seconds INT DEFAULT NULL,
  event_date DATE DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  scope VARCHAR(20) NOT NULL DEFAULT 'zonal',
  state VARCHAR(120) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by INT NOT NULL,
  updated_by INT DEFAULT NULL,
  published_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX media_state_idx (state),
  INDEX media_status_idx (status),
  INDEX media_event_date_idx (event_date),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE publication_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  content_html MEDIUMTEXT DEFAULT NULL,
  publication_type VARCHAR(60) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  cover_image_url VARCHAR(500) DEFAULT NULL,
  publish_date DATE DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  scope VARCHAR(20) NOT NULL DEFAULT 'zonal',
  state VARCHAR(120) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by INT NOT NULL,
  updated_by INT DEFAULT NULL,
  published_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX publication_state_idx (state),
  INDEX publication_status_idx (status),
  INDEX publication_date_idx (publish_date),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE biodata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  fellowship_centre_id INT DEFAULT NULL,
  full_name VARCHAR(200) DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  age INT DEFAULT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  email VARCHAR(190) DEFAULT NULL,
  state VARCHAR(120) DEFAULT NULL,
  region VARCHAR(120) DEFAULT NULL,
  cluster VARCHAR(120) DEFAULT NULL,
  profile_photo MEDIUMTEXT DEFAULT NULL,
  school VARCHAR(200) DEFAULT NULL,
  category VARCHAR(80) DEFAULT NULL,
  worker_status VARCHAR(40) DEFAULT NULL,
  membership_status VARCHAR(40) DEFAULT NULL,
  work_units TEXT DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  next_of_kin_name VARCHAR(200) DEFAULT NULL,
  next_of_kin_phone VARCHAR(40) DEFAULT NULL,
  next_of_kin_relationship VARCHAR(80) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (fellowship_centre_id) REFERENCES fellowship_centres(id),
  INDEX biodata_email_idx (email),
  INDEX biodata_phone_idx (phone)
);

CREATE TABLE state_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  feature_image_url VARCHAR(500) DEFAULT NULL,
  content MEDIUMTEXT NOT NULL,
  type VARCHAR(60) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at DATETIME DEFAULT NULL,
  created_by INT NOT NULL,
  updated_by INT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY unique_state_post (state_id, slug),
  INDEX state_posts_state_idx (state_id),
  INDEX state_posts_status_idx (status),
  FOREIGN KEY (state_id) REFERENCES states(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE state_post_categories (
  post_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES state_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE state_homepages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_id INT NOT NULL UNIQUE,
  content MEDIUMTEXT NOT NULL,
  updated_by INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (state_id) REFERENCES states(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
