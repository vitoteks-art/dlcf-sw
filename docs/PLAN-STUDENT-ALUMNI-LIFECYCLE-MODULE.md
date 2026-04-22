# PLAN - STUDENT-ALUMNI-LIFECYCLE-MODULE

## Project ID
`STUDENT-ALUMNI-LIFECYCLE-MODULE`

## Goal
Turn the current alumni support from a biodata classification into a proper lifecycle module with:
- a dedicated leadership dashboard/review surface
- automatic student-to-alumni movement rules
- automatic NYSC-to-alumni transition support where appropriate
- manual override controls so leadership stays in control

## Current Position in Codebase
Already implemented foundation:
- biodata fields for:
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
- biodata form support for those fields
- lifecycle status options in UI/API
- biodata list filtering by `student_status`
- biodata lifecycle report page with grouped summaries
- lifecycle-related planning docs already present

This means we should build on the current biodata/lifecycle foundation rather than creating a disconnected subsystem.

## Problem Summary
Right now alumni is still too shallow.

Current gaps:
- no dedicated alumni dashboard
- no clear enforced transition rule
- no automatic movement engine
- no controlled student → alumni decision flow
- no NYSC-aware transition logic
- no clear manual override layer for exceptions

## Product Objective
Make alumni work as an actual lifecycle module, not just a label.

Leadership should be able to:
- see student, graduate, alumni-ready, alumni, and NYSC populations clearly
- understand who is due for transition
- allow the system to move eligible people automatically by rule
- manually correct or override edge cases when needed

## Scope

### In scope
1. Dedicated alumni lifecycle dashboard/review surface
2. Stronger lifecycle reporting and filtering
3. Automatic student-to-alumni movement logic
4. Automatic NYSC-complete to alumni movement logic where rules qualify
5. Manual override controls for lifecycle status decisions
6. Human-friendly lifecycle labels and visibility across reports/list/detail screens
7. Preserve compatibility with current biodata structure

### Out of scope for this phase
- separate public alumni community portal
- alumni messaging/notification campaigns
- social/community networking features
- large redesign of the entire biodata system beyond needed lifecycle surfaces

## Recommended Lifecycle Model

### Stage meanings
- `active_student`
  - currently in school and still in active academic lifecycle
- `graduated`
  - academic program completed, but not fully transitioned yet
- `alumni_ready`
  - satisfies transition criteria and should either be automatically promoted or queued for leadership review depending on rule mode
- `alumni`
  - officially transitioned into alumni status
- `deferred`
  - academic path delayed/paused
- `withdrawn`
  - no longer active in expected student lifecycle

## Transition Logic Direction

### Core principle
The system should support **automatic movement with override**, not blind irreversible updates.

### Proposed rule model

#### Rule A: student progression signal
A member can become `alumni_ready` when one or more of these is true:
- `expected_graduation_year` has passed
- `academic_level` indicates graduation/completion
- `student_status` has been manually marked `graduated`

#### Rule B: alumni promotion
A member can move from `graduated` or `alumni_ready` to `alumni` automatically when configured rule conditions are met.

#### Rule C: NYSC-aware promotion
If Victor wants NYSC to matter in the lifecycle, then:
- members with completed school and `nysc_status = completed` can be promoted automatically to `alumni`
- members still serving NYSC remain visible in the dashboard as a distinct in-between operational group even if they are effectively post-student

## Recommended practical interpretation
To avoid confusion, the dashboard should clearly distinguish:
- Active Students
- Graduated Awaiting Review
- Alumni Ready
- Serving NYSC
- NYSC Completed
- Alumni

That gives leadership clarity even when some people are post-school but not yet fully settled operationally.

## Dashboard Requirement
Build a dedicated leadership-facing alumni lifecycle dashboard.

### Dashboard purpose
Answer questions such as:
- how many active students do we have?
- who is graduating soon?
- who has graduated?
- who is alumni-ready?
- who is still serving NYSC?
- who completed NYSC?
- who has already transitioned to alumni?
- who was auto-moved and who was manually overridden?

### Minimum dashboard sections
1. Lifecycle summary cards
   - Active Students
   - Graduated
   - Alumni Ready
   - Alumni
   - NYSC Serving
   - NYSC Completed
2. Transition candidates table
3. Recently transitioned table
4. Override-needed / exception list if possible

## Functional Changes

### 1. Dedicated alumni dashboard
Add a dedicated alumni lifecycle dashboard/report surface for leadership.

### 2. Smarter lifecycle filtering
Improve filtering for:
- student status
- NYSC status
- expected graduation year
- likely alumni-ready
- auto-transitioned vs manually overridden if tracked in MVP

### 3. Automatic transition engine
Introduce backend rule evaluation that can:
- detect likely alumni-ready members
- detect NYSC-completed members
- move qualified records to the appropriate status automatically

### 4. Manual override flow
Leadership must be able to:
- prevent a premature auto transition
- manually mark a member as alumni
- manually revert/correct a lifecycle state where justified

### 5. Lifecycle visibility improvements
Make all relevant surfaces show lifecycle state clearly:
- dashboard
- biodata list
- lifecycle report
- detail/profile views

## Data / Logic Notes
Prefer lean implementation first.

Potential approach:
- keep `student_status` as the main stored lifecycle field
- compute candidate/automation decisions from:
  - `expected_graduation_year`
  - `academic_level`
  - `student_status`
  - `nysc_status`
- add lightweight tracking metadata if needed, such as:
  - auto_transition_source
  - last_lifecycle_evaluated_at
  - lifecycle_override_flag

If schema expansion is needed, keep it minimal and backward-compatible.

## Backend Plan
Primary backend target:
- `dlcf-sw/api/index.php`

Expected backend work:
- expand lifecycle reporting endpoints/queries
- add dedicated alumni dashboard summary response(s)
- add transition evaluation logic
- add auto-move behavior with safe guards
- support manual override actions
- preserve current scoped leadership access behavior

## Frontend Plan
Primary targets:
- `dlcf-sw/web/src/pages/BiodataLifecycleReportPage.jsx`
- `dlcf-sw/web/src/pages/BiodataListPage.jsx`
- `dlcf-sw/web/src/pages/ProfilePage.jsx`
- `dlcf-sw/web/src/App.jsx`
- new dedicated alumni lifecycle dashboard page if needed

Expected frontend work:
- dedicated dashboard surface
- stronger lifecycle summary sections
- improved alumni/NYSC filters
- visibility into transition candidates
- manual override controls where appropriate

## Safety / Control Rules
- no silent destructive bulk change without clear lifecycle rule checks
- leadership override must remain possible
- automatic transitions should be rule-driven and auditable
- current biodata records must remain compatible

## Acceptance Criteria
1. Leadership has a dedicated alumni lifecycle dashboard/review surface
2. The system can automatically identify and move eligible members through lifecycle states based on defined rules
3. NYSC-completed members can be moved toward alumni state according to the approved rule logic
4. Leadership can manually override lifecycle outcomes when needed
5. Lifecycle/report/list/profile views clearly show status in human-friendly form
6. Existing biodata flows continue to work without regression
7. Build passes after implementation

## Recommendation
This expanded version is the right direction if Victor wants alumni to behave like a true operational module.

That means this build should now cover:
- dashboard
- transition rules
- auto movement
- override control
- clearer lifecycle reporting
