# DLCF-SW Student Lifecycle Automation Plan

## Project ID
`DLCF-SW-STUDENT-LIFECYCLE-AUTOMATION`

## Goal
Automatically move students through the lifecycle using their biodata graduation year, while allowing both students and admins to mark exception statuses before automation runs.

## Approved Business Rule
Lifecycle status flow:

`active_student -> graduated -> alumni`

Exception statuses:

- `deferred` — skipped by automation; student remains treated as a student.
- `withdrawn` — skipped by automation; student is no longer counted as an active student.

Who can set exceptions:

- Student can mark self as `deferred` or `withdrawn` from their profile/biodata area.
- Admin can mark any student as `deferred` or `withdrawn`.
- Admin can correct/reverse mistakes where necessary.

## Current Fields Already Present
The codebase already has:

- `biodata.entry_year`
- `biodata.expected_graduation_year`
- `biodata.academic_level`
- `biodata.student_status`
- `biodata.nysc_status`
- lifecycle report/dashboard surfaces
- `record_biodata_history(...)` helper usage for status change history

## Status Definitions

### active_student
A member currently studying in school. Automation can move this status when graduation year has elapsed.

### deferred
A student whose academic timeline is delayed. Automation must not graduate or alumni-promote this student.

### withdrawn
A student who has withdrawn from school/program. Automation must not graduate or alumni-promote this student.

### graduated
A student whose expected graduation year has elapsed. This is the first automatic transition.

### alumni
A graduated past student. This is the second automatic transition.

## Automation Design

### Cron 1: Auto-graduate eligible students
Run monthly.

Eligibility:

- `student_status = active_student` OR `student_status IS NULL` for student/corper-like biodata records
- `expected_graduation_year` is not null
- current year is greater than `expected_graduation_year`
- status is not `deferred`
- status is not `withdrawn`

Action:

- update `student_status` to `graduated`
- log history with actor `system_cron`
- include metadata/reason: `Expected graduation year elapsed`

### Cron 2: Auto-promote graduated students to alumni
Run monthly after Cron 1.

Eligibility:

- `student_status = graduated`

Action:

- update `student_status` to `alumni`
- optionally set alumni marker if present/needed
- log history with actor `system_cron`
- include metadata/reason: `Graduated student auto-promoted to alumni`

## Recommended Timing
Use a single monthly job script with two explicit steps:

1. `graduate_elapsed_students`
2. `promote_graduated_to_alumni`

This keeps deployment simpler while preserving clean transition history.

Example schedule:

```cron
0 2 1 * * php /path/to/api/jobs/student_lifecycle_automation.php >> /path/to/logs/student_lifecycle_automation.log 2>&1
```

## Backend Implementation

### New job script
Add:

- `api/jobs/student_lifecycle_automation.php`

Responsibilities:

- bootstrap database config
- find eligible active students
- move them to `graduated`
- find graduated students
- move them to `alumni`
- log every transition
- print summary counts for cron logs

### Optional admin/manual endpoint hardening
Update existing lifecycle transition handling so:

- students can only set their own status to `deferred` or `withdrawn`
- admins can set/correct allowed statuses
- every change captures reason/date/actor where possible

## Frontend Implementation

### Student self-service status update
Add/update biodata/profile UI:

- student can choose:
  - Keep Active Student
  - Mark Deferred
  - Mark Withdrawn
- require reason field when selecting `deferred` or `withdrawn`
- show clear warning that automation will skip deferred/withdrawn statuses

### Admin lifecycle controls
Keep/admin improve existing lifecycle dashboard controls:

- admin can update status
- admin can see current status, expected graduation year, recommended status, and last update

## Data/History
Every transition should record:

- biodata/member id
- previous status
- new status
- actor type: `student`, `admin`, or `system_cron`
- actor user id where available
- reason
- timestamp

If the existing history structure cannot store all metadata cleanly, use the existing supported history fields first and add a lightweight note/metadata field only if necessary.

## Acceptance Criteria

1. Active students with elapsed graduation year are automatically moved to `graduated`.
2. Graduated students are automatically moved to `alumni`.
3. Deferred students are skipped by automation.
4. Withdrawn students are skipped by automation.
5. Students can mark themselves as deferred/withdrawn.
6. Admins can mark students as deferred/withdrawn and correct status where needed.
7. Every automatic/manual status movement is logged.
8. Monthly cron command is documented.
9. Backend PHP syntax check passes.
10. Frontend build passes.

## Non-Goals For This Batch

- No separate alumni portal.
- No email/WhatsApp notifications yet.
- No STMC dependency.
- No manual approval queue before alumni promotion.

## Files Likely To Change

- `api/index.php`
- `api/jobs/student_lifecycle_automation.php`
- `web/src/pages/BiodataPage.jsx`
- `web/src/pages/ProfilePage.jsx` or a small status component
- `web/src/pages/BiodataLifecycleDashboardPage.jsx`
- `docs/RUNBOOK.md` or a dedicated deploy note
- `docs/SMOKE-TEST.md`

## Build/QA Plan

Run:

- `php -l api/index.php`
- `php -l api/jobs/student_lifecycle_automation.php`
- `cd web && npm run build`
- `cd web && npm run lint`

Manual smoke:

- set a student to deferred and confirm cron skips them
- set a student to withdrawn and confirm cron skips them
- create/test active student with old graduation year and confirm cron moves to graduated then alumni
- confirm lifecycle report reflects new statuses
