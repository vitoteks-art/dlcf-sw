# DLCF-SW Student Alumni Lifecycle UI Spec

## Project ID
`DLCF-SW-STUDENT-ALUMNI-LIFECYCLE`

## Goal
Make the existing student and NYSC biodata fields easier for leadership to interpret and act on through clearer lifecycle views and filters.

## Target Screens
- Biodata Lifecycle Report
- Biodata List / Directory filters

## UI Objectives
- clearly separate lifecycle states
- make alumni-focused review easier
- make NYSC review easier
- avoid redesigning the entire biodata module

## Biodata Lifecycle Report
Primary screen:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataLifecycleReportPage.jsx`

### Required improvements
The lifecycle report should feel less like a raw dump and more like a leadership summary.

#### Add clearer sections for:
- Student Status Summary
- NYSC Status Summary
- Program Type Summary
- Academic Level Summary
- Expected Graduation View if available

#### UX expectation
Each section should present grouped counts in a readable way.

Examples:
- Active Students
- Graduated
- Alumni Ready
- Alumni
- Deferred
- Withdrawn
- NYSC Serving
- NYSC Completed

## Biodata Directory Filters
Primary screen:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataListPage.jsx`

### Required additions
Add lifecycle-aware filtering options where practical, such as:
- Student Status filter
- NYSC Status filter
- optional search by expected graduation year if feasible in MVP

### Filter goals
Leadership should be able to quickly narrow the list to:
- current students
- alumni-ready members
- alumni
- serving corpers
- completed NYSC members

## Presentation Rules
- use friendly labels, not raw field names
- keep current state/region/centre scoping behavior intact
- preserve current biodata detail panel and only extend it where helpful

## Non-Goals for this MVP
- no separate alumni dashboard yet
- no automation wizard
- no timeline visualization
- no student-to-alumni cron job in this batch

## Acceptance Criteria
- lifecycle report is easier to read than the current raw grouping
- leadership can filter biodata by student status and NYSC status
- lifecycle-related statuses are displayed with human-friendly labels
- no regression in existing biodata list and report flows
