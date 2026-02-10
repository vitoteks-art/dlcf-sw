INSERT INTO users (name, email, password_hash, role, state, region, created_at, updated_at)
VALUES (
  'Admin',
  'admin@example.com',
  -- Replace with password_hash() output from PHP for your real password.
  '$2y$10$replace_with_real_hash',
  'administrator',
  NULL,
  NULL,
  NOW(),
  NOW()
);
