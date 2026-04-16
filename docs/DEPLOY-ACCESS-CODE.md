# DLCF-SW Attendance Access Code Deploy Notes

## Feature Summary
This deploy adds login-first attendance code authorization.

### Direct attendance access without code
- administrator
- zonal_cord
- zonal_admin
- state_cord
- state_admin
- region_cord
- region_admin
- associate_cord (own centre scope)

### Code-gated attendance access
- other logged-in users must enter a valid attendance access code before submitting attendance
- code remains valid until manually revoked

## Files changed
### Backend
- `api/index.php`
- `scripts/migrations/20260416_attendance_access_codes.sql`
- `scripts/seed_roles.sql`

### Frontend
- `web/src/App.jsx`
- `web/src/pages/AdminPage.jsx`
- `web/src/pages/PortalHome.jsx`
- `web/src/components/admin/AdminAttendanceCodes.jsx`

## Required database step
Run:
- `scripts/migrations/20260416_attendance_access_codes.sql`

This creates:
- `attendance_access_codes`
- `attendance_access_sessions`
- `attendance_access_audit_logs`
- new linkage columns on `attendance_entries`

## Role seed note
`region_admin` was added to `scripts/seed_roles.sql`.
If your production DB does not already contain this role, add it manually or re-run the seed carefully.

Example safe insert:
```sql
INSERT IGNORE INTO roles (name, created_at, updated_at)
VALUES ('region_admin', NOW(), NOW());
```

## Recommended deploy order
1. Backup database
2. Upload backend changes
3. Run migration SQL
4. Ensure `region_admin` exists in `roles`
5. Upload rebuilt frontend `web/dist`
6. Test with:
   - exempt admin-level attendance role
   - normal logged-in user with valid code
   - revoked code
   - associate cord code generation for own centre

## Smoke test checklist
1. Login as state admin
2. Open Admin → Attendance Codes
3. Generate code for a fellowship centre
4. Copy code
5. Login as non-exempt user
6. Open attendance portal
7. Confirm attendance form is blocked until code is entered
8. Enter valid code
9. Confirm form unlocks with centre/state/region locked
10. Submit attendance
11. Revoke code as admin
12. Confirm new authorization attempts fail

## Current MVP limitations
- code-authorized users cannot edit existing attendance records
- no brute-force throttling yet
- no packaged release zip generated in this batch
