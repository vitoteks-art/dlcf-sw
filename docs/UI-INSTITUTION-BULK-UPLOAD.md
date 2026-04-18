# UI SPEC — DLCF-SW-INSTITUTION-BULK-UPLOAD

## Screen location
Integrate inside the existing admin flow:
- `Admin > Organization Management > Institutions`
- file: `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/components/admin/AdminOrganization.jsx`

## UI approach
Keep the current manual institution add/edit form, but add a second card below or beside it for **Bulk Upload Institutions**.

This keeps both workflows available:
- quick single add
- fast Excel bulk import

## Layout

### Card 1: Existing manual form
No major layout change required.

### Card 2: Bulk Upload Institutions
A new card in the Institutions panel with:
- heading: `Bulk Upload Institutions`
- short helper text:
  - `Upload an Excel file with these columns: state, institution_name`
- file picker accepting `.xlsx`
- optional small sample table preview in text form
- primary action button: `Upload and Import`
- secondary action button: `Clear`

## Sample format shown in UI
Display a small example block:

| state | institution_name |
| --- | --- |
| Oyo State (Central) | University of Ibadan |
| Lagos State | University of Lagos |

If Telegram-safe/plain rendering is needed elsewhere, equivalent text is:
- state, institution_name
- Oyo State (Central), University of Ibadan
- Lagos State, University of Lagos

## Interaction flow

### Initial state
User sees:
- upload instructions
- file input
- disabled import button until a file is selected

### After file selection
System should:
- parse the Excel file
- validate headers
- extract rows
- show a lightweight preview summary, for example:
  - `24 rows detected`
  - `Ready to import`

### On import
When user clicks `Upload and Import`:
- send parsed rows to backend bulk import endpoint
- disable button while request is running
- show loading text such as `Importing institutions...`

### On success
Show summary card/status such as:
- `Import completed`
- `18 institutions added`
- `4 skipped`

Also show row-level reasons where available, such as:
- row 5: missing state
- row 8: duplicate institution in database
- row 11: duplicate row in file

Refresh the institution list after a successful import.

### On failure
Show clear error messages for:
- invalid file type
- missing required headers
- empty file
- server validation failure

## Scope behavior

### Administrator / zonal roles
- can upload rows for multiple states
- `state` column is fully honored

### State coordinator
- upload UI still visible if they can manage institutions
- if uploaded file contains rows outside their own state, backend should reject those rows or coerce them according to final backend rule
- UI should show returned row-level errors clearly

## Visual details
- use existing admin card styling
- keep controls compact and consistent with current Organization Management design
- do not create a new page for MVP

## Validation feedback
Show these checks before or after submit:
- missing `state` header
- missing `institution_name` header
- blank row skipped
- blank state skipped
- blank institution name skipped
- duplicate state + institution in file skipped
- duplicate state + institution already in database skipped

## Suggested component changes
Primary file to update:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/components/admin/AdminOrganization.jsx`

Supporting wiring likely needed in:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

## UX acceptance criteria
- user can select an `.xlsx` file from the Institutions admin tab
- UI clearly tells user required columns are `state` and `institution_name`
- user gets success/skip/error summary after import
- institutions table refreshes after successful upload
- manual add/edit flow continues to work unchanged
