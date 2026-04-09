ALTER TABLE state_posts
  ADD COLUMN event_location VARCHAR(255) NULL AFTER type,
  ADD COLUMN event_start_date DATE NULL AFTER event_location,
  ADD COLUMN event_end_date DATE NULL AFTER event_start_date,
  ADD COLUMN event_time_label VARCHAR(120) NULL AFTER event_end_date;

