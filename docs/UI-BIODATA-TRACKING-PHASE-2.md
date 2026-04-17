# DLCF-SW Biodata Tracking Phase 2 UI Spec

## Project ID
`DLCF-SW-BIODATA-TRACKING-PHASE-2`

## Goal
Add the next missing biodata fields and surface them consistently across the existing biodata experience, while keeping the interface familiar.

## New User-Facing Fields
- `Date of Birth`
- `Marital Status`

## UX Principles
- fit into the current biodata form naturally
- do not redesign the full biodata page
- keep current category-aware visibility behavior intact
- remain backward-compatible for existing records with empty values

## Biodata Form UI
Primary screen:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataPage.jsx`

### Required additions
Add the following inputs to the biodata form:

#### Date of Birth
- input type: `date`
- label: `Date of Birth`
- optional in MVP

#### Marital Status
- input type: `select`
- label: `Marital Status`
- default blank option: `Select marital status`

Suggested options:
- `Single`
- `Married`
- `Engaged`
- `Widowed`
- `Separated`

### Placement
Recommended placement:
- place near other personal biodata fields, not inside NYSC-only or spiritual-only sections
- do not hide these fields by category unless a later product rule requires it

## Biodata Detail / Admin View
Primary screen:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataListPage.jsx`

### Required behavior
Show the new fields in biodata details, using the same display style as other biodata metadata.

Expected display:
- Date of Birth: value or `-`
- Marital Status: value or `-`

## Profile View
Primary screen:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/ProfilePage.jsx`

### Required behavior
Expose the new fields in the profile biodata summary where other tracking fields are already displayed.

Expected display:
- Date of Birth
- Marital Status

## Validation UX
- invalid date should not be accepted by the form
- marital status must come from the allowed list
- empty values remain allowed for backward compatibility

## Lifecycle History UI
Phase 2 is mainly backend-driven for history recording.

### MVP UI stance
- no major dedicated history screen required in this phase unless implementation turns out lightweight
- history may remain invisible in UI for now as long as it is recorded reliably

## Acceptance Criteria
- biodata form includes Date of Birth and Marital Status
- existing biodata records still render correctly when these values are empty
- admin biodata details show the fields
- profile biodata summary shows the fields
- new UI feels like a natural extension of the current form, not a redesign
