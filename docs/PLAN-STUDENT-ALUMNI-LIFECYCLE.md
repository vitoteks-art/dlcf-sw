# DLCF-SW Student Alumni Lifecycle Plan

## Project ID
`DLCF-SW-STUDENT-ALUMNI-LIFECYCLE`

## Goal
Turn the existing biodata student fields into a more usable lifecycle system for tracking members from active student stage through graduation, alumni readiness, alumni status, and related NYSC context.

## Current Position
The codebase already has foundational fields in place:
- `program_type`
- `academic_level`
- `entry_year`
- `expected_graduation_year`
- `student_status`
- `nysc_status`
- `nysc_batch`
- `nysc_state`
- `nysc_start_date`
- `nysc_end_date`
- lifecycle history for tracked biodata changes

This means the next phase should build on existing data, not re-create the foundation.

## Problem Summary
Right now, student/alumni state is mostly a set of fields, not a focused lifecycle module.

The system still lacks:
- dedicated lifecycle visibility for leadership
- alumni-oriented filtering/reporting
- smoother transition handling between student, graduate, alumni-ready, alumni, and NYSC states
- focused lifecycle summaries beyond raw biodata records

## Scope

### In scope
1. strengthen lifecycle statuses and reporting around:
   - `active_student`
   - `graduated`
   - `alumni_ready`
   - `alumni`
   - `deferred`
   - `withdrawn`
2. improve leadership visibility into student vs alumni populations
3. add dedicated lifecycle filtering/reporting surfaces where needed
4. make NYSC-related state easier to review alongside lifecycle status
5. preserve compatibility with current biodata structure

### Out of scope
- fully automated scheduled alumni promotion job in this first batch
- messaging/notification automations
- separate alumni portal
- heavy analytics dashboards beyond useful MVP reports

## Functional Changes

### 1. Lifecycle-focused report improvements
Build stronger reporting for:
- student status counts
- program type grouping
- academic level grouping
- expected graduation year grouping
- NYSC status grouping
- alumni-oriented breakdowns

### 2. Better filtering for biodata directory
Allow leadership to quickly filter for:
- students only
- alumni only
- alumni-ready only
- corpers / NYSC-serving members
- by graduation year where useful

### 3. Lifecycle summary view
Provide a clearer surface or report where leaders can answer questions like:
- how many active students do we have?
- who is graduating soon?
- who is alumni-ready but not yet marked alumni?
- who is currently serving NYSC?

### 4. Data discipline
Use existing `student_status` and `nysc_status` fields as the source of truth for MVP.

Optional lightweight rule support in this phase:
- flag likely alumni-ready members based on expected graduation year
- show this as a report hint rather than auto-changing status

## Backend Changes
Primary target:
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`

Expected backend tasks:
- expand lifecycle report queries
- support new filters where necessary
- expose lifecycle-focused summaries in a usable format

## Frontend Changes
Primary targets:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataLifecycleReportPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataListPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

Expected frontend tasks:
- improve lifecycle report presentation
- add more useful lifecycle filters
- make alumni/NYSC review easier for leadership

## Acceptance Criteria
- leadership can clearly distinguish active students, graduates, alumni-ready, alumni, deferred, and withdrawn members
- lifecycle reporting is more actionable than the current raw grouping
- NYSC status is easier to review in context
- existing biodata records and forms continue to work
- no regression in current biodata tracking flows

## Recommended Build Order
1. inspect current lifecycle report output and directory filters
2. define the exact additional filters and summaries
3. expand backend lifecycle reporting endpoint(s)
4. update frontend lifecycle report screen
5. update biodata directory filters if needed
6. verify state/region scoped leadership views still behave correctly
7. run build/test pass and package for deployment
