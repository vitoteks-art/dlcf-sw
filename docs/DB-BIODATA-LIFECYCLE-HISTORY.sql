CREATE TABLE biodata_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  biodata_id INT NOT NULL,
  field_name VARCHAR(60) NOT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  changed_by_user_id INT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_biodata_status_history_biodata_id (biodata_id),
  INDEX idx_biodata_status_history_field_name (field_name),
  INDEX idx_biodata_status_history_changed_at (changed_at)
);
