ALTER TABLE giving_campaigns
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_urgent;

ALTER TABLE giving_campaigns
  ADD INDEX giving_featured_idx (is_featured);
