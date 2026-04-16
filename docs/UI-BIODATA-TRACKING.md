# DLCF-SW Biodata Tracking UI Spec

## Goal
Extend the existing biodata experience so members can enter deeper lifecycle and spiritual data, while leadership can review structured summaries without exposing sensitive data to ordinary users.

## UX Principles
- Keep the biodata form familiar
- Group new fields into clear sections
- Avoid overwhelming users with too many unrelated inputs in one block
- Make reports readable and scope-aware
- Keep biodata directory/report access hidden from unauthorized users

## Screen 1: Biodata Form (`/biodata`)

### Existing sections retained
- personal information
- fellowship information
- membership/work-unit information
- next-of-kin details

### New section: Academic Information
Fields:
- Program Type
  - dropdown: `ND`, `HND`, `NCE`, `BSc`, `PG`, `Other`
- Academic Level
  - dropdown: `100`, `200`, `300`, `400`, `500`, `600`, `PG`, `Graduated`
- Entry Year
  - number/year input
- Expected Graduation Year
  - number/year input
- Student Status
  - dropdown:
    - `Active Student`
    - `Graduated`
    - `Alumni Ready`
    - `Alumni`
    - `Deferred`
    - `Withdrawn`

### New section: NYSC Information
Fields:
- NYSC Status
  - dropdown:
    - `None`
    - `Serving`
    - `Completed`
- NYSC Batch
  - text input or dropdown
- NYSC State
  - text input or dropdown
- NYSC Start Date
  - date input
- NYSC End Date
  - date input

Behavior:
- if NYSC Status = `None`, related NYSC fields can be hidden or visually de-emphasized
- if NYSC Status = `Serving` or `Completed`, batch/state fields should be shown prominently

### New section: Spiritual Tracking
Fields:
- New Birth
  - radio/select: `Yes` / `No`
- Sanctification
  - radio/select: `Yes` / `No`
- Holy Ghost Baptism
  - radio/select: `Yes` / `No`
- Spiritual Notes
  - textarea (optional)

### Form UX details
- use section headings to separate the new groups
- do not put all new fields in one long flat grid
- keep required indicators clear only where truly required
- preserve current submit/update behavior

## Screen 2: Biodata Profile / Detail View

### For member viewing own biodata
Display the new fields clearly in grouped cards:
- Academic Information
- NYSC Information
- Spiritual Tracking

### For leadership viewing a record
Same grouped presentation, but with complete scope-allowed visibility.

Suggested presentation:
- compact summary rows
- readable labels
- status chips for yes/no and lifecycle states

Example chips:
- `Born Again: Yes`
- `Sanctified: No`
- `Holy Ghost Baptism: Yes`
- `Student Status: Active Student`
- `NYSC: Serving`

## Screen 3: Biodata Directory (`/biodata-list`)

### Main table
Keep the main table reasonably compact.

Suggested visible columns:
- Full Name
- Gender
- Phone
- School
- Fellowship Centre
- State
- Region
- Student Status
- NYSC Status

### Expanded row / details area
When a record expands, show:
- Program Type
- Academic Level
- Entry Year
- Expected Graduation Year
- New Birth
- Sanctification
- Holy Ghost Baptism
- Spiritual Notes
- NYSC Batch
- NYSC State
- NYSC Start/End Dates

This keeps the list readable while still exposing the deeper data.

### Filters
Add or preserve filters for:
- State
- Region
- Fellowship Centre
- Search

Optional future filters:
- Program Type
- Student Status
- NYSC Status

## Screen 4: Spiritual Tracking Report (`/biodata-report/spiritual`)

### Audience
Leadership only.

### Purpose
Show high-level spiritual milestone totals and percentages for the user’s permitted scope.

### Layout
Top summary cards:
- Total Members
- Born Again (%)
- Sanctified (%)
- Holy Ghost Baptism (%)

Then a simple breakdown table:
- Milestone
- Yes Count
- No Count
- Percentage Yes

Rows:
- New Birth
- Sanctification
- Holy Ghost Baptism

### Scope banner
Show scope context, for example:
- `Viewing: Oyo State`
- `Viewing: Ibadan Region`
- `Viewing: UI Central Fellowship`

## Screen 5: Lifecycle Report (`/biodata-report/lifecycle`)

### Audience
Leadership only.

### Purpose
Help leaders understand educational and post-school member distribution.

### Layout
Top summary cards:
- Total Members
- Active Students
- Alumni Ready / Alumni
- NYSC Serving

### Sections
#### A. Program Type Breakdown
Table or cards showing counts for:
- ND
- HND
- NCE
- BSc
- PG
- Other

#### B. Academic Level Breakdown
Counts by level:
- 100
- 200
- 300
- 400
- 500
- 600
- PG
- Graduated

#### C. Student Status Breakdown
Counts by:
- Active Student
- Graduated
- Alumni Ready
- Alumni
- Deferred
- Withdrawn

#### D. NYSC Breakdown
Counts by:
- None
- Serving
- Completed

Optional extra table:
- NYSC batches represented in current scope

## Screen 6: Navigation / Access

### Visible to all logged-in users
- `/profile`
- `/biodata`

### Visible only to authorized leadership roles
- `Biodata List`
- `Spiritual Report`
- `Lifecycle Report`

### Unauthorized users
- should not see these report links
- direct route access should redirect or show forbidden handling

## Mobile Behavior
- biodata form sections stack cleanly
- report summary cards stack vertically
- expanded biodata detail remains readable without horizontal clutter where possible
- use expandable cards instead of very wide tables if needed

## Validation / UX Notes
- entry year and expected graduation year should be numeric and realistic
- expected graduation year should not be earlier than entry year
- spiritual status should be explicit yes/no, not blank in the final UX if possible
- if student status is `Alumni`, academic level can be `Graduated`
- if NYSC status is `None`, hide/disable batch/date/state inputs

## UI Acceptance Criteria
- biodata form includes academic, NYSC, and spiritual sections
- members can submit/update the new fields
- biodata list shows student status and NYSC status at a glance
- expanded biodata details reveal the deeper tracking fields
- spiritual report is leadership-only and scoped correctly
- lifecycle report is leadership-only and scoped correctly
- unauthorized users do not see biodata directory/report navigation
