CREATE TABLE IF NOT EXISTS zonal_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  feature_image_url VARCHAR(500) DEFAULT NULL,
  content MEDIUMTEXT NOT NULL,
  type VARCHAR(60) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at DATETIME DEFAULT NULL,
  event_location VARCHAR(255) DEFAULT NULL,
  event_start_date DATE DEFAULT NULL,
  event_end_date DATE DEFAULT NULL,
  event_time_label VARCHAR(120) DEFAULT NULL,
  recurrence_mode VARCHAR(20) NOT NULL DEFAULT 'one_time',
  recurrence_day_of_week VARCHAR(20) DEFAULT NULL,
  archive_at DATETIME DEFAULT NULL,
  created_by INT NOT NULL,
  updated_by INT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX zonal_events_status_idx (status),
  INDEX zonal_events_date_idx (event_start_date),
  INDEX zonal_events_recurrence_idx (recurrence_mode),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS zonal_event_categories (
  event_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (event_id, category_id),
  FOREIGN KEY (event_id) REFERENCES zonal_events(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
