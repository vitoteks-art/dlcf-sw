-- DLCF-SW student lifecycle automation support
-- Adds reason/actor metadata to biodata status history so cron and user/admin status changes are auditable.

ALTER TABLE biodata_status_history
  ADD COLUMN actor_type VARCHAR(40) NULL AFTER changed_by_user_id,
  ADD COLUMN change_reason TEXT NULL AFTER actor_type;

CREATE INDEX idx_biodata_status_history_actor_type ON biodata_status_history (actor_type);
