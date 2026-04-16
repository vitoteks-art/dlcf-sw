# DLCF-SW Biodata Tracking Plan

## Scope
Implement the next biodata expansion layer for DLCF-SW so the platform can track spiritual growth, academic/student lifecycle, alumni transition readiness, and NYSC status in a structured way.

### In scope
- Extend biodata data model for spiritual milestone tracking
- Extend biodata data model for student lifecycle tracking
- Add NYSC-related fields
- Update biodata form and biodata detail/report views
- Add leadership reports for spiritual milestone percentages and lifecycle breakdowns
- Preserve strict role-based biodata visibility rules already being enforced

### Out of scope
- Full alumni auto-migration job in this batch
- Messaging/notification workflows to alumni or NYSC members
- Full STMC LMS features
- Follow-up workflow automation
- Historical milestone timeline beyond minimal first-pass support

## Requirement Summary
This feature should let leadership answer questions like:
- How many members are born again?
- How many are sanctified?
- How many have received Holy Ghost baptism?
- How many are active students, alumni-ready, serving NYSC, or done with service?
- What academic programs and levels are represented across centres, regions, states, and zonal scope?

## Product Goals
1. Turn biodata into a reliable leadership intelligence source
2. Capture spiritual status in structured yes/no fields
3. Track academic progression and future alumni transition
4. Track NYSC members separately and accurately
5. Keep reporting scoped according to leadership level

## User Flows

### 1. Member completes biodata
1. Logged-in member opens biodata form
2. Member fills personal, fellowship, school, and next-of-kin details
3. Member also fills academic and spiritual tracking fields
4. System saves structured biodata record

### 2. Leadership reviews biodata
1. Authorized zonal/state/region/associate leader opens biodata directory
2. System automatically applies scope restrictions
3. Leader can search/filter members within allowed scope
4. Leader can review spiritual and lifecycle fields in the biodata detail/list

### 3. Leadership reviews spiritual report
1. Authorized leader opens spiritual tracking report
2. System shows totals and percentages for:
   - New Birth
   - Sanctification
   - Holy Ghost Baptism
3. Scope is applied by role level automatically

### 4. Leadership reviews student/lifecycle report
1. Authorized leader opens lifecycle report
2. System shows members grouped by:
   - program type
   - academic level
   - student status
   - NYSC status
3. Scope is applied by role level automatically

## Data Model

### Extend existing `biodata` table
Add these columns:

#### Academic / lifecycle fields
- `program_type` VARCHAR(40) NULL
  - examples: `ND`, `HND`, `NCE`, `BSc`, `PG`
- `academic_level` VARCHAR(40) NULL
  - examples: `100`, `200`, `300`, `400`, `500`, `PG`, `graduated`
- `entry_year` YEAR NULL
- `expected_graduation_year` YEAR NULL
- `student_status` VARCHAR(40) NULL
  - examples: `active_student`, `graduated`, `alumni_ready`, `alumni`, `deferred`, `withdrawn`

#### NYSC fields
- `nysc_status` VARCHAR(30) NULL
  - examples: `none`, `serving`, `completed`
- `nysc_batch` VARCHAR(30) NULL
- `nysc_state` VARCHAR(120) NULL
- `nysc_start_date` DATE NULL
- `nysc_end_date` DATE NULL

#### Spiritual tracking fields
- `new_birth_status` TINYINT(1) NOT NULL DEFAULT 0
- `sanctification_status` TINYINT(1) NOT NULL DEFAULT 0
- `holy_ghost_baptism_status` TINYINT(1) NOT NULL DEFAULT 0
- `spiritual_notes` TEXT NULL

### Optional future tables
Not mandatory for this first batch, but reserved for future:
- `member_spiritual_milestones`
- `member_status_history`

## Authorization Rules

### Who can submit/update own biodata
- logged-in member for own biodata
- authorized leadership roles where the current system already permits admin-side biodata management

### Who can view biodata directory
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`

### Scope rules for directory and reports
- `administrator`, `zonal_cord`, `zonal_admin` → all records
- `state_cord`, `state_admin` → only own state
- `region_cord`, `region_admin` → only own region
- `associate_cord` → only own fellowship centre

## API Plan

### Biodata endpoints to update
#### `POST /biodata`
Accept new academic, NYSC, and spiritual fields.

#### `PUT /biodata/:id`
Allow leadership updates to the new fields, still within scope.

#### `GET /biodata`
Return the new fields in list responses.

#### `GET /biodata/:id`
Return the new fields in detail responses.

### New reporting endpoints
#### `GET /biodata-reports/spiritual`
Returns counts and percentages for:
- total members in scope
- new birth yes/no
- sanctification yes/no
- holy ghost baptism yes/no

Optional filters:
- state
- region
- fellowship_centre

#### `GET /biodata-reports/lifecycle`
Returns grouped counts for:
- program_type
- academic_level
- student_status
- nysc_status
- nysc_batch

Optional filters:
- state
- region
- fellowship_centre

## Frontend Plan

## Biodata Form
Add sections:

### A. Academic Information
Fields:
- Program Type
- Academic Level
- Entry Year
- Expected Graduation Year
- Student Status

### B. NYSC Information
Fields:
- NYSC Status
- Batch
- Service State
- Start Date
- End Date

Behavior:
- hide or disable some fields when `nysc_status = none`

### C. Spiritual Tracking
Fields:
- New Birth (`Yes/No`)
- Sanctification (`Yes/No`)
- Holy Ghost Baptism (`Yes/No`)
- Spiritual Notes (optional)

## Biodata Directory UI
Update list/detail display to include:
- Program Type
- Academic Level
- Student Status
- NYSC Status
- Spiritual milestone statuses

Need to avoid clutter, so some fields can be in expanded detail rows instead of main table columns.

## Reports UI
Add two new report views or tabs:

### Spiritual Tracking Report
Displays:
- total members in scope
- counts + percentages for each spiritual milestone

### Lifecycle Report
Displays grouped totals for:
- program types
- academic levels
- student statuses
- NYSC statuses

## Page Map
- `/biodata` → updated biodata form
- `/biodata-list` → updated biodata directory
- `/biodata-report/spiritual` → new spiritual report page
- `/biodata-report/lifecycle` → new lifecycle report page

## Validation Rules

### Academic fields
- `program_type` optional but controlled to known values
- `entry_year` must be valid year
- `expected_graduation_year` must be >= `entry_year` when both exist

### NYSC fields
- if `nysc_status = serving` or `completed`, batch should be strongly encouraged or required
- if `nysc_status = none`, batch/state/date fields can be empty

### Spiritual fields
- store as boolean yes/no
- default to `No` if omitted in first pass, but frontend should ask explicitly

## Jobs / Cron
None required in this batch.

Future batch can add:
- alumni readiness evaluation job
- NYSC completion reminders

## Security Basics
- keep biodata listing strict and role-scoped
- do not expose biodata reports to members
- validate leadership scope on report endpoints, not only on frontend
- sanitize text fields such as spiritual notes
- continue requiring auth for all biodata report access

## Delivery Phases

### Phase 1
- DB migration for biodata expansion
- backend endpoint updates for CRUD
- biodata form UI update

### Phase 2
- biodata list/detail UI update
- spiritual report endpoint + UI
- lifecycle report endpoint + UI

### Phase 3
- polish validation
- optional export support
- prep for alumni automation

## Definition of Done
- biodata records can store academic, NYSC, and spiritual milestone fields
- authorized users can view the new fields within correct scope
- members cannot view biodata directory/reports
- spiritual tracking report works by leadership scope
- lifecycle report works by leadership scope
- build passes and backend syntax passes
