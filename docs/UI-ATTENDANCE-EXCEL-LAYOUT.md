# UI SPEC — DLCF-SW-ATTENDANCE-EXCEL-LAYOUT

## Feature surface
This change affects the **Attendance Report Excel export output** only.
The report screen can keep its current table for now, while the downloaded `.xlsx` file becomes structured like Victor's reference sheet.

Primary file likely involved:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/AttendanceReportPage.jsx`

## Export layout target
The generated Excel sheet should feel like an official reporting sheet, not a raw data dump.

## Top header area
Use multiple rows at the top for report identity, with merged cells where appropriate.
Suggested structure:

1. Church / group title row
2. Weekly attendance report title row
3. Group name row
4. Group coordinator row
5. Month row
6. Week row

These top rows should be visually separated from the data table.

## Table header structure
Use multi-row grouped headers.

### Leading columns
- `S/N`
- `DISTRICT`

### Service blocks
Create one grouped block for each service:
- `TRETS`
- `SWS`
- `MBS`
- `HCF`

### Inside each service block
Use category groups:
- `Adult`
- `Student`
- `Children`
- `TOTAL`

### Inside each category group
- `M`
- `F`

So each service block becomes:
- Adult M
- Adult F
- Student M
- Student F
- Children M
- Children F
- TOTAL

## Label rules
For Excel export only:
- display `Student` instead of `Youth`

## Row rules
Each fellowship centre should occupy one row.

### Bottom total row
Add a final row labeled `TOTAL`.
This row should sum all numeric attendance columns across the report rows.

## Styling direction
Use spreadsheet styling where available:
- merged header cells
- centered service titles
- bold top header rows
- bold grouped column headers
- bordered table cells
- wider district column
- emphasized bottom TOTAL row

## Export behavior
- export respects current report filters
- export remains attendance-only
- exclude visitors, converts, and tithe and offering from Excel

## UX acceptance criteria
- downloaded file opens with structured grouped headers
- `Youth` is shown as `Student`
- service blocks resemble Victor's sample sheet
- final TOTAL row is present
- district names are readable
- workbook remains valid `.xlsx`
