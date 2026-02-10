ALTER TABLE publication_items
  ADD COLUMN content_html MEDIUMTEXT DEFAULT NULL AFTER description;
