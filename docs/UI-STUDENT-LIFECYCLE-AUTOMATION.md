# DLCF-SW Student Lifecycle Automation UI Spec

## Project ID
`DLCF-SW-STUDENT-LIFECYCLE-AUTOMATION`

## Goal
Add clear UI support for the approved automated lifecycle flow:

`active_student -> graduated -> alumni`

with student/admin exception controls for:

- `deferred`
- `withdrawn`

## Screen 1: Biodata Form / Student Self-Service
Primary file:

- `web/src/pages/BiodataPage.jsx`

### Current issue
The biodata form currently lets users choose all lifecycle statuses, including `graduated`, `alumni_ready`, and `alumni`. That creates confusion and allows students to manually promote themselves.

### Required UI change
For normal biodata/profile completion, simplify the visible status options.

Student-facing options should be:

- `active_student` — Active Student
- `deferred` — Deferred
- `withdrawn` — Withdrawn

Remove/hide from student self-service status dropdown:

- `graduated`
- `alumni_ready`
- `alumni`

Those should be controlled by automation/admin only.

### Help text
Under Student Status, show:

> The system automatically moves active students to Graduated and then Alumni when their graduation year elapses. Choose Deferred or Withdrawn only if your academic status has changed.

### Reason field
When user selects `deferred` or `withdrawn`, show:

- `Reason for status change` textarea

Reason should be required for deferred/withdrawn status changes.

### Confirmation text
When `deferred` or `withdrawn` is selected, show warning:

> This status will pause automatic graduation/alumni movement until it is corrected.

## Screen 2: Profile Page
Primary file:

- `web/src/pages/ProfilePage.jsx`

### Required UI change
Display lifecycle status with friendly labels:

- Active Student
- Deferred
- Withdrawn
- Graduated
- Alumni

Add a small note near status:

> Graduation automation uses your expected graduation year.

If profile status is deferred or withdrawn, show:

> Automation is currently paused for this profile.

## Screen 3: Admin Lifecycle Dashboard
Primary file:

- `web/src/pages/BiodataLifecycleDashboardPage.jsx`

### Required UI change
Rename/reshape sections to match automatic flow.

Suggested sections:

1. Lifecycle Counts
2. Eligible for Graduation
3. Graduated Awaiting Alumni Promotion
4. Skipped by Automation
5. Recent Lifecycle Changes

### Candidate table behavior
The old manual action buttons should not be the primary workflow anymore.

Update copy from manual review language to automation language:

- "Eligible for Graduation" = active students whose graduation year has elapsed.
- "Graduated Awaiting Alumni Promotion" = graduated students waiting for the second cron step.
- "Skipped by Automation" = deferred/withdrawn students.

### Admin override controls
Admin may still correct statuses, but these should be shown as exception/correction tools, not the main workflow.

Recommended controls:

- Mark Deferred
- Mark Withdrawn
- Restore Active Student

Avoid presenting “Mark Alumni” as the main action because alumni movement is automatic.

## Status labels
Use one shared label map where practical:

```js
const STATUS_LABELS = {
  active_student: "Active Student",
  graduated: "Graduated",
  alumni: "Alumni",
  deferred: "Deferred",
  withdrawn: "Withdrawn",
};
```

Deprecate `alumni_ready` in UI for this flow. Existing records may still display it for backward compatibility, but new movement should not create it.

## Empty states

### No eligible students
> No students are eligible for graduation automation right now.

### No graduated students awaiting alumni promotion
> No graduated students are awaiting alumni promotion right now.

### No skipped students
> No deferred or withdrawn students found.

## Acceptance Criteria

1. Student cannot manually select `graduated` or `alumni` from regular biodata form.
2. Student can select `deferred` or `withdrawn`.
3. Reason field appears for deferred/withdrawn.
4. Profile page explains current automation status clearly.
5. Admin lifecycle dashboard reflects automated process, not manual approval flow.
6. Existing records with `alumni_ready` do not break display.
7. Frontend build passes.
