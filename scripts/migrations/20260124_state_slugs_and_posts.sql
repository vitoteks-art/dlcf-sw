-- Add slug column to states if missing.
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'states'
    AND COLUMN_NAME = 'slug'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE states ADD COLUMN slug VARCHAR(140) NULL AFTER name',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill slugs for existing states.
UPDATE states
SET slug = TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-'))
WHERE slug IS NULL OR slug = '';

-- Ensure slug uniqueness by appending id when duplicates exist.
UPDATE states s
JOIN (
  SELECT slug
  FROM states
  GROUP BY slug
  HAVING COUNT(*) > 1
) d ON s.slug = d.slug
SET s.slug = CONCAT(s.slug, '-', s.id);

-- Enforce uniqueness and NOT NULL after backfill.
SET @index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'states'
    AND INDEX_NAME = 'slug'
);
SET @sql = IF(
  @index_exists = 0,
  'CREATE UNIQUE INDEX slug ON states (slug)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE states MODIFY slug VARCHAR(140) NOT NULL;

-- Create state_posts table if missing.
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'state_posts'
);
SET @sql = IF(
  @table_exists = 0,
  'CREATE TABLE state_posts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     state_id INT NOT NULL,
     title VARCHAR(200) NOT NULL,
     slug VARCHAR(200) NOT NULL,
     feature_image_url VARCHAR(500) DEFAULT NULL,
     content MEDIUMTEXT NOT NULL,
     type VARCHAR(60) NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT ''draft'',
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
   )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add feature_image_url if state_posts already exists.
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'state_posts'
    AND COLUMN_NAME = 'feature_image_url'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE state_posts ADD COLUMN feature_image_url VARCHAR(500) DEFAULT NULL AFTER slug',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create categories table if missing.
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
);
SET @sql = IF(
  @table_exists = 0,
  'CREATE TABLE categories (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(120) NOT NULL UNIQUE,
     slug VARCHAR(140) NOT NULL UNIQUE,
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL
   )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create state_post_categories table if missing.
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'state_post_categories'
);
SET @sql = IF(
  @table_exists = 0,
  'CREATE TABLE state_post_categories (
     post_id INT NOT NULL,
     category_id INT NOT NULL,
     PRIMARY KEY (post_id, category_id),
     FOREIGN KEY (post_id) REFERENCES state_posts(id) ON DELETE CASCADE,
     FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
   )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create state_homepages table if missing.
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'state_homepages'
);
SET @sql = IF(
  @table_exists = 0,
  'CREATE TABLE state_homepages (
     id INT AUTO_INCREMENT PRIMARY KEY,
     state_id INT NOT NULL UNIQUE,
     content MEDIUMTEXT NOT NULL,
     updated_by INT NOT NULL,
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL,
     FOREIGN KEY (state_id) REFERENCES states(id),
     FOREIGN KEY (updated_by) REFERENCES users(id)
   )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
