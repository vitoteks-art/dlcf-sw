ALTER TABLE state_posts
  ADD COLUMN recurrence_mode VARCHAR(20) NULL AFTER event_time_label,
  ADD COLUMN recurrence_day_of_week VARCHAR(20) NULL AFTER recurrence_mode,
  ADD COLUMN archive_at DATETIME NULL AFTER recurrence_day_of_week,
  ADD INDEX state_posts_recurrence_mode_idx (recurrence_mode),
  ADD INDEX state_posts_archive_at_idx (archive_at);
