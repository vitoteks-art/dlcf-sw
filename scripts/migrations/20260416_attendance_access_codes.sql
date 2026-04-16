CREATE TABLE attendance_access_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code_hash VARCHAR(255) NOT NULL,
  code_label VARCHAR(190) DEFAULT NULL,
  scope_type VARCHAR(50) NOT NULL DEFAULT 'fellowship_centre',
  fellowship_centre_id INT NOT NULL,
  state VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_by INT NOT NULL,
  revoked_by INT DEFAULT NULL,
  last_used_at DATETIME DEFAULT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX attendance_access_codes_scope_idx (fellowship_centre_id, status),
  INDEX attendance_access_codes_created_by_idx (created_by),
  FOREIGN KEY (fellowship_centre_id) REFERENCES fellowship_centres(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (revoked_by) REFERENCES users(id)
);

CREATE TABLE attendance_access_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_access_code_id INT NOT NULL,
  user_id INT NOT NULL,
  session_token_hash VARCHAR(255) NOT NULL,
  fellowship_centre_id INT NOT NULL,
  state VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  ip_address VARCHAR(64) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  last_seen_at DATETIME DEFAULT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX attendance_access_sessions_user_idx (user_id, status),
  INDEX attendance_access_sessions_code_idx (attendance_access_code_id, status),
  FOREIGN KEY (attendance_access_code_id) REFERENCES attendance_access_codes(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (fellowship_centre_id) REFERENCES fellowship_centres(id)
);

CREATE TABLE attendance_access_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_access_code_id INT DEFAULT NULL,
  attendance_access_session_id INT DEFAULT NULL,
  actor_user_id INT DEFAULT NULL,
  action VARCHAR(50) NOT NULL,
  metadata_json MEDIUMTEXT DEFAULT NULL,
  created_at DATETIME NOT NULL,
  INDEX attendance_access_audit_action_idx (action),
  INDEX attendance_access_audit_code_idx (attendance_access_code_id),
  FOREIGN KEY (attendance_access_code_id) REFERENCES attendance_access_codes(id) ON DELETE SET NULL,
  FOREIGN KEY (attendance_access_session_id) REFERENCES attendance_access_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE attendance_entries
  ADD COLUMN attendance_access_code_id INT DEFAULT NULL AFTER created_by,
  ADD COLUMN attendance_access_session_id INT DEFAULT NULL AFTER attendance_access_code_id,
  ADD INDEX attendance_entries_access_code_idx (attendance_access_code_id),
  ADD INDEX attendance_entries_access_session_idx (attendance_access_session_id),
  ADD CONSTRAINT fk_attendance_entries_access_code FOREIGN KEY (attendance_access_code_id) REFERENCES attendance_access_codes(id),
  ADD CONSTRAINT fk_attendance_entries_access_session FOREIGN KEY (attendance_access_session_id) REFERENCES attendance_access_sessions(id);
