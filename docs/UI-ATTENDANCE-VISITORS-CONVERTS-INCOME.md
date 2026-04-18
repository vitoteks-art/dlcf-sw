# UI SPEC — DLCF-SW-ATTENDANCE-VISITORS-CONVERTS-INCOME

## Screen locations
- Attendance entry page / portal attendance form
- Attendance report page
- Attendance Excel export output

Primary files likely involved:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/PortalHome.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/AttendanceReportPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

## Attendance entry UI
Keep the existing attendance count layout for:
- adult male/female
- youth male/female
- children male/female

Then add a new summary section below the count grid.

### New section title
`Service Summary`

### Fields in Service Summary
1. `Visitors`
   - input type: number
   - min: 0
   - clearable while typing

2. `Converts`
   - input type: number
   - min: 0
   - clearable while typing

3. `Tithe and Offering`
   - input type: number
   - min: 0
   - step: `0.01`
   - clearable while typing
   - label should stay exactly `Tithe and Offering`

## Attendance load/edit behavior
When an existing attendance record is loaded:
- populate visitors
- populate converts
- populate tithe and offering

When updating an existing record:
- save changes to all three fields together with attendance counts

## Attendance report UI
Keep current row grouping by fellowship centre.

For each service block, extend the columns to include:
- Adult M
- Adult F
- Youth M
- Youth F
- Children M
- Children F
- Total
- Visitors
- Converts
- Tithe and Offering

This should apply to each service group already shown in the report:
- TRETS
- SWS
- MBS
- HCF

## Table behavior
Visitors and converts should not be merged into attendance total.
They should appear as separate metrics after the attendance total.

Tithe and Offering should appear as its own amount column.

## Totals row
The totals row at the bottom should also sum:
- visitors
- converts
- tithe and offering

for each service block.

## Excel export
Excel export should match the on-screen report layout and include:
- attendance breakdown
- attendance total
- visitors
- converts
- tithe and offering

## Empty and validation states
- blank numeric fields can be left empty while typing
- blank values should save as 0
- invalid negative values should be blocked

## UX acceptance criteria
- user can enter visitors, converts, and tithe and offering on attendance entry page
- values can be cleared and retyped without the old zero-sticking issue
- existing record loads these values correctly
- report shows these fields clearly for each service block
- Excel export includes these new columns
