# DLCF-SW Congress Biodata Autofill UI Spec

## Project ID
`DLCF-SW-CONGRESS-BIODATA-AUTOFILL`

## Goal
Make biodata lookup inside State Congress and Zonal Congress registration forms behave like a real autofill action, matching the retreat workflow.

## Target Screens
- State Congress Registration
- Zonal Congress Registration

## User Flow
1. Officer searches biodata by name, email, or phone.
2. Matching biodata results appear.
3. Officer clicks the explicit apply action for a result.
4. The congress registration form auto-fills relevant participant data.
5. Officer adjusts any event-specific fields if needed and submits.

## Lookup Card Behavior

### Required interaction
Each lookup result should have an explicit action such as:
- `Use Biodata`

Avoid passive-looking result rows that make it unclear whether clicking the row will apply the data.

### After apply
- form fields fill immediately
- success feedback appears
- result list clears

Suggested feedback:
- `Biodata loaded into the registration form.`

## Autofill Mapping
For both State Congress and Zonal Congress forms, autofill when available:
- Full Name
- Gender
- Email
- Phone
- Category
- Membership Status
- State
- Region
- Cluster
- Fellowship Centre

## Preserve Manual/Event-Specific Fields
Do not overwrite congress-specific fields that are not biodata-derived.

Examples:
- event-specific date context
- title, unless deliberately mapped
- custom event flags/status fields

## Dependent Selector Behavior
Because state/region/fellowship selections are chained, applying biodata must also keep the option lists aligned.

Expected outcome after apply:
- selected state is visible
- region options reflect that state
- selected region is visible
- fellowship centre options reflect state + region
- selected fellowship centre remains visible
- cluster remains visible when available

If cluster is missing from biodata:
- leave cluster blank
- do not block the other autofill fields

## State Congress Page

### Required UI result
- lookup card remains on page
- selected biodata fills the state congress form
- state-scoped selectors still remain valid after apply

## Zonal Congress Page

### Required UI result
- lookup card remains on page
- selected biodata fills the zonal congress form
- state and region dependent selectors remain valid after apply

## Acceptance Criteria
- state congress lookup returns biodata matches
- zonal congress lookup returns biodata matches
- each result has a clear apply action
- applying a result auto-fills the correct form
- dependent selector options refresh correctly
- success feedback appears after apply
- officers no longer need to manually re-enter available biodata fields
