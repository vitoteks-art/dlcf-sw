-- DLCF-SW Follow-up Workflow MVP — cPanel/MySQL-safe version
-- Use this if the FK version fails with errno: 150 "Foreign key constraint is incorrectly formed".
-- This version intentionally omits FOREIGN KEY constraints because production tables may use different INT/BIGINT signedness.
-- It keeps the same columns and indexes required by the application.

CREATE TABLE IF NOT EXISTS followup_contacts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_type VARCHAR(40) NOT NULL DEFAULT 'manual',
  source_id BIGINT UNSIGNED NULL,
  attendance_entry_id INT NULL,
  fellowship_centre_id INT NULL,
  state VARCHAR(120) NULL,
  region VARCHAR(120) NULL,
  full_name VARCHAR(190) NOT NULL,
  gender VARCHAR(30) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(190) NULL,
  decision_type VARCHAR(60) NOT NULL DEFAULT 'visitor',
  category VARCHAR(80) NULL,
  address TEXT NULL,
  notes TEXT NULL,
  consent_to_contact TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_followup_contacts_scope (state, region, fellowship_centre_id),
  INDEX idx_followup_contacts_source (source_type, source_id),
  INDEX idx_followup_contacts_attendance (attendance_entry_id),
  INDEX idx_followup_contacts_phone (phone),
  INDEX idx_followup_contacts_email (email),
  INDEX idx_followup_contacts_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id BIGINT UNSIGNED NOT NULL,
  assigned_to_user_id INT NULL,
  assigned_by_user_id INT NULL,
  status VARCHAR(60) NOT NULL DEFAULT 'new',
  priority VARCHAR(30) NOT NULL DEFAULT 'normal',
  due_date DATE NULL,
  next_followup_at DATETIME NULL,
  last_contacted_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_followup_tasks_contact (contact_id),
  INDEX idx_followup_tasks_assigned_to (assigned_to_user_id),
  INDEX idx_followup_tasks_assigned_by (assigned_by_user_id),
  INDEX idx_followup_tasks_status_due (status, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  user_id INT NULL,
  note_type VARCHAR(50) NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_followup_notes_task (task_id, created_at),
  INDEX idx_followup_notes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  channel VARCHAR(30) NOT NULL,
  name VARCHAR(120) NOT NULL,
  subject VARCHAR(190) NULL,
  body TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_message_templates_channel_active (channel, is_active),
  INDEX idx_message_templates_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_message_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  template_id BIGINT UNSIGNED NULL,
  channel VARCHAR(30) NOT NULL,
  recipient VARCHAR(190) NOT NULL,
  subject VARCHAR(190) NULL,
  body_snapshot TEXT NOT NULL,
  send_mode VARCHAR(30) NOT NULL DEFAULT 'manual',
  provider_message_id VARCHAR(190) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  error_message TEXT NULL,
  sent_by_user_id INT NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_followup_message_logs_task (task_id, created_at),
  INDEX idx_followup_message_logs_contact (contact_id),
  INDEX idx_followup_message_logs_template (template_id),
  INDEX idx_followup_message_logs_sent_by (sent_by_user_id),
  INDEX idx_followup_message_logs_channel_status (channel, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integration_evolution_api_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  base_url VARCHAR(255) NOT NULL DEFAULT '',
  instance_name VARCHAR(120) NOT NULL DEFAULT '',
  instance_key VARCHAR(190) NOT NULL DEFAULT '',
  api_token TEXT NULL,
  send_endpoint_path VARCHAR(255) NOT NULL DEFAULT '/message/sendText/{instance_name}',
  default_country_code VARCHAR(10) NOT NULL DEFAULT '234',
  updated_by INT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_integration_evolution_api_settings_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO message_templates (channel, name, subject, body, is_active, created_at, updated_at)
SELECT 'whatsapp', 'First follow-up WhatsApp', NULL,
'Hello {{name}}, we were glad to have you with DLCF South West. We would love to follow up with you and help you stay connected. God bless you.', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM message_templates WHERE channel = 'whatsapp' AND name = 'First follow-up WhatsApp');

INSERT INTO message_templates (channel, name, subject, body, is_active, created_at, updated_at)
SELECT 'email', 'First follow-up Email', 'Thank you for joining DLCF South West',
'Dear {{name}},\n\nWe were glad to have you with DLCF South West. Our follow-up team would love to connect with you, pray with you, and help you find a fellowship centre.\n\nGod bless you.', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM message_templates WHERE channel = 'email' AND name = 'First follow-up Email');
