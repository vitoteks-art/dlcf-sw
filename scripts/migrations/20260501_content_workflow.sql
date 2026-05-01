-- DLCF-SW Publication & Media workflow standardization
-- Apply after 20260127_media_publications.sql and 20260127_publication_content.sql.

ALTER TABLE media_items
  ADD COLUMN slug VARCHAR(220) DEFAULT NULL AFTER title,
  ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'public' AFTER state,
  ADD COLUMN workflow_note TEXT DEFAULT NULL AFTER visibility,
  ADD COLUMN seo_title VARCHAR(220) DEFAULT NULL AFTER workflow_note,
  ADD COLUMN seo_description TEXT DEFAULT NULL AFTER seo_title,
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER seo_description,
  ADD COLUMN pinned_until DATETIME DEFAULT NULL AFTER is_featured,
  ADD COLUMN scheduled_at DATETIME DEFAULT NULL AFTER pinned_until,
  ADD COLUMN approved_at DATETIME DEFAULT NULL AFTER scheduled_at,
  ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER approved_at,
  ADD COLUMN rejected_at DATETIME DEFAULT NULL AFTER archived_at;

ALTER TABLE media_items
  ADD UNIQUE KEY media_slug_unique (slug),
  ADD INDEX media_scope_status_idx (scope, state, status),
  ADD INDEX media_featured_idx (is_featured),
  ADD INDEX media_scheduled_idx (scheduled_at);

ALTER TABLE publication_items
  ADD COLUMN slug VARCHAR(220) DEFAULT NULL AFTER title,
  ADD COLUMN author VARCHAR(160) DEFAULT NULL AFTER publication_type,
  ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'public' AFTER state,
  ADD COLUMN workflow_note TEXT DEFAULT NULL AFTER visibility,
  ADD COLUMN seo_title VARCHAR(220) DEFAULT NULL AFTER workflow_note,
  ADD COLUMN seo_description TEXT DEFAULT NULL AFTER seo_title,
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER seo_description,
  ADD COLUMN pinned_until DATETIME DEFAULT NULL AFTER is_featured,
  ADD COLUMN scheduled_at DATETIME DEFAULT NULL AFTER pinned_until,
  ADD COLUMN approved_at DATETIME DEFAULT NULL AFTER scheduled_at,
  ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER approved_at,
  ADD COLUMN rejected_at DATETIME DEFAULT NULL AFTER archived_at;

ALTER TABLE publication_items
  ADD UNIQUE KEY publication_slug_unique (slug),
  ADD INDEX publication_scope_status_idx (scope, state, status),
  ADD INDEX publication_featured_idx (is_featured),
  ADD INDEX publication_scheduled_idx (scheduled_at);
