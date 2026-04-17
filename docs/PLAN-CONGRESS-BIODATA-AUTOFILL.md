# DLCF-SW Congress Biodata Autofill Plan

## Project ID
`DLCF-SW-CONGRESS-BIODATA-AUTOFILL`

## Goal
Extend the working retreat biodata lookup autofill pattern to both State Congress and Zonal Congress registration forms so officers can load an existing participant's biodata directly into the registration form.

## Problem Summary
State Congress and Zonal Congress already expose biodata lookup, but the workflow is still incomplete if the selected result only appears as a search hit instead of fully assisting registration.

The working retreat pattern should now be replicated consistently.

## Target Surfaces
- State Congress registration form
- Zonal Congress registration form

## Intended Behavior
When a registration officer searches biodata and selects a result:
- the form should auto-fill with the participant's biodata
- the officer should only adjust congress-specific fields if needed
- lookup results should then clear
- success feedback should be shown

## Fields to Autofill
For both State Congress and Zonal Congress forms, autofill these where applicable:
- full name
- gender
- email
- phone
- category
- membership status
- state
- region
- fellowship centre
- cluster

If the form has additional matching fields already present and sourced from biodata safely, reuse them.

## Fields to Keep Manual
Do not overwrite congress-specific operator-controlled fields that are not sourced from biodata, unless the form intentionally maps them from biodata.

Examples:
- date-specific registration context
- title, if not modeled in biodata
- any event-specific status/action field

## Backend Need
Likely no new backend endpoint is required if `/biodata/lookup` already returns the fields needed.

Use the same expanded biodata lookup payload already implemented for retreat autofill.

## Frontend Need
Primary targets:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/StateCongressPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/ZonalCongressPage.jsx`

Expected work:
- add explicit apply action if current rows are ambiguous
- map biodata fields into each form state
- refresh dependent state/region/centre options where needed
- show short success feedback after apply

## UX Rules
- applying biodata should be one click/tap
- if dependent dropdowns exist, they must refresh so autofilled values remain visible
- if some biodata field is missing, fill what is available without breaking the form
- lookup should assist registration, not merely display a search result

## Acceptance Criteria
- biodata lookup works on State Congress registration
- biodata lookup works on Zonal Congress registration
- selecting a biodata result auto-fills the respective registration form
- dependent region/fellowship selectors remain consistent after autofill
- lookup results clear after apply
- success feedback is shown after biodata is applied

## Recommended Build Order
1. inspect current `apply` behavior in State Congress page
2. inspect current `apply` behavior in Zonal Congress page
3. update autofill mapping in both pages
4. refresh dependent option lists where needed
5. verify state congress flow
6. verify zonal congress flow
