# SMOKE TEST - STATE-GALLERY-ADMIN

## Scope
Verify the dedicated admin-managed state gallery system and the public state gallery page using real gallery records.

## Build / Checks
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)
- Backend syntax: `php -l api/index.php` ✅

## Manual Smoke Checklist

### 1. Migration is applied
- Apply `scripts/migrations/20260421_state_gallery_items.sql`
- Confirm `state_gallery_items` table exists

### 2. Admin State Gallery tab appears
- Open Admin Dashboard
- Confirm `State Gallery` tab is visible for authorized users

### 3. Admin can create gallery item
- Open `State Gallery`
- Fill state, title, category, image, status
- Save item
- Confirm item appears in the admin list

### 4. Image upload works
- Use image upload field
- Confirm uploaded image URL populates the form
- Save successfully

### 5. Admin list filters work
- Filter by state
- Filter by status
- Filter by category
- Confirm results update correctly

### 6. Edit and delete work
- Edit an existing gallery item
- Confirm changes persist
- Delete an item
- Confirm it is removed from list

### 7. Public gallery route uses dedicated data
- Open `/:stateId/gallery`
- Confirm published gallery items for that state render
- Confirm page no longer depends on sermon/media records

### 8. Public category filters work
- Click category pills
- Confirm visible gallery cards filter in-place

### 9. Draft visibility works
- Save a gallery item as `draft`
- Confirm it does not appear on the public gallery page
- Change to `published`
- Confirm it appears publicly

## Notes
- Current lint output contains pre-existing warnings in the project and does not block this MVP.
- Gallery categories now come from dedicated gallery records instead of derived sermon/media metadata.

---

# SMOKE TEST - STUDENT-LIFECYCLE-AUTOMATION

## Scope
Verify automatic student lifecycle movement and exception statuses.

## Build / Checks
- Backend syntax: `php -l api/index.php` ✅
- Cron syntax: `php -l api/jobs/student_lifecycle_automation.php` ✅
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)

## Manual Checklist
1. Apply `scripts/migrations/20260425_student_lifecycle_automation.sql`.
2. Open biodata form as a student and confirm Student Status only offers Active Student, Deferred, Withdrawn.
3. Select Deferred or Withdrawn and confirm reason field appears and is required.
4. Confirm a student cannot self-select Graduated or Alumni.
5. Create/test an active student whose expected graduation year has elapsed.
6. Run `php api/jobs/student_lifecycle_automation.php`.
7. Confirm active student becomes Graduated and then Alumni through the two automation steps.
8. Confirm `biodata_status_history` records actor type `system_cron` and reasons for both changes.
9. Mark a student Deferred and rerun cron; confirm status is skipped.
10. Mark a student Withdrawn and rerun cron; confirm status is skipped.
11. Open Alumni Lifecycle Dashboard and confirm eligible, promotion, and skipped sections render.

---

# SMOKE TEST - FOLLOW-UP-WORKFLOW

## Scope
Verify visitor/convert follow-up capture, assignment, messaging, and reports.

## Build / Checks
- Backend syntax: `php -l api/index.php` ✅
- Follow-up routes syntax: `php -l api/followup_routes.php` ✅
- Notification helper syntax: `php -l api/lib/notification_service.php` ✅
- Reminder cron syntax: `php -l api/jobs/followup_reminders.php` ✅
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)

## Manual Checklist
1. Apply `scripts/migrations/20260426_followup_workflow.sql`.
2. Configure backend-only Evolution API placeholders in production config.
3. Submit attendance with one Visitor/Convert Follow-up Details row.
4. Submit GCK report with one session follow-up contact row.
5. Confirm records appear under `/followups`.
6. Open a follow-up detail page and update assigned worker, status, priority, due date, and next follow-up.
7. Add a note and confirm it appears in the timeline.
8. Send Email and WhatsApp; confirm message attempts are logged.
9. If Evolution API is not configured, confirm WhatsApp failure logs and fallback WhatsApp link opens.
10. Edit/create templates under `/followups/templates`.
11. Open `/reports/followups` and confirm totals/status/overdue sections render.
12. Run `php api/jobs/followup_reminders.php` and confirm it completes without fatal error.
