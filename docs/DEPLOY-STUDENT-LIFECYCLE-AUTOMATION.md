# Deploy — Student Lifecycle Automation

## Project
`DLCF-SW-STUDENT-LIFECYCLE-AUTOMATION`

## Files changed/added
- `api/index.php`
- `api/jobs/student_lifecycle_automation.php`
- `scripts/migrations/20260425_student_lifecycle_automation.sql`
- `web/src/App.jsx`
- `web/src/pages/BiodataPage.jsx`
- `web/src/pages/ProfilePage.jsx`
- `web/src/pages/BiodataLifecycleDashboardPage.jsx`
- `docs/PLAN-STUDENT-LIFECYCLE-AUTOMATION.md`
- `docs/UI-STUDENT-LIFECYCLE-AUTOMATION.md`

## Database migration
Run this once before using the new lifecycle status logging metadata:

```sql
scripts/migrations/20260425_student_lifecycle_automation.sql
```

It adds:
- `biodata_status_history.actor_type`
- `biodata_status_history.change_reason`
- index on `actor_type`

## Cron setup
Run the automation monthly after deployment.

Recommended cron:

```cron
0 2 1 * * php /home/<cpanel-user>/public_html/api/jobs/student_lifecycle_automation.php >> /home/<cpanel-user>/logs/student_lifecycle_automation.log 2>&1
```

Adjust paths to the production cPanel structure.

## Automation rules
1. Active student with elapsed graduation year becomes `graduated`.
2. Graduated student becomes `alumni`.
3. `deferred` and `withdrawn` are skipped.
4. Every change is logged in `biodata_status_history` with `actor_type` and `change_reason`.

## Verification run locally
- `php -l api/index.php` — PASS
- `php -l api/jobs/student_lifecycle_automation.php` — PASS
- `cd web && npm run build` — PASS
- `cd web && npm run lint` — PASS with 44 warnings, 0 errors

## Manual smoke test
1. Create/update a student biodata record with `expected_graduation_year` less than current year and `student_status = active_student`.
2. Run `php api/jobs/student_lifecycle_automation.php`.
3. Confirm status becomes `alumni` after both monthly steps run.
4. Confirm two history rows exist: `active_student -> graduated`, then `graduated -> alumni`.
5. Set another student to `deferred`; rerun job; confirm status does not change.
6. Set another student to `withdrawn`; rerun job; confirm status does not change.
7. Confirm biodata form only lets students select Active Student, Deferred, or Withdrawn.
