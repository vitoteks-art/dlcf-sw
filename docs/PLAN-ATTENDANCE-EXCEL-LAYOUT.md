# PLAN — DLCF-SW-ATTENDANCE-EXCEL-LAYOUT

## Goal
Redesign the attendance Excel export so it matches the structured weekly report layout Victor shared.

## Reference direction
Target format should follow the screenshots provided by Victor:
- multi-row merged title/header area
- grouped service sections across the sheet
- category blocks under each service
- M/F sub-columns
- total column per service block
- final TOTAL row at the bottom

## Confirmed label mapping
For report/export presentation only:
- `adult` -> `Adult`
- `youth` -> `Student`
- `children` -> `Children`

No backend category rename is required.

## Scope

### In scope
- redesign Attendance Excel export layout
- use merged cells for title and grouped headers
- label `youth` as `Student` in export
- include serial number and district columns
- include per-service totals
- include final total row
- preserve current attendance data source and filters

### Out of scope for this upgrade
- changing on-screen report table to exact spreadsheet style
- changing stored category names in database
- adding visitors/converts/offering to Excel export
- changing GCK export in this same task

## Required export structure
Top header rows should support values like:
- church/group title
- report title
- group name
- group coordinator
- month
- week

Then service blocks such as:
- TRETS
- SWS
- MBS
- HCF

Each service block should contain:
- Adult -> M, F
- Student -> M, F
- Children -> M, F
- TOTAL

## Data rules
- export remains attendance-only
- visitors, converts, and tithe and offering stay excluded from Excel
- final TOTAL row sums attendance columns across all listed centres

## Technical plan
- replace the current flat worksheet export builder in `AttendanceReportPage.jsx`
- generate worksheet rows in multi-row grouped format
- apply XLSX merge ranges for title/header cells
- apply column widths for readability
- apply bold/center styling where supported by current library path
- keep generated file `.xlsx`

## Likely files to change
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/AttendanceReportPage.jsx`

## Acceptance criteria
- exported Excel visually resembles the provided sample structure
- `youth` appears as `Student` in export
- service blocks each show Adult, Student, Children, and TOTAL
- bottom TOTAL row is present
- export respects selected report filters
- visitors/converts/tithe and offering are not included

## Recommendation
Implement this as an export-only formatting pass first, matching the screenshot as closely as SheetJS community features allow, without disturbing the underlying attendance report data model.
