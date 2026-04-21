# PLAN - FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT

## Goal
Upgrade fellowship records so the public fellowship directory becomes genuinely useful and admin users can maintain richer fellowship information directly from the existing fellowship management flow.

## Requested Data Fields
For each fellowship, add support for:
- `name`
- `state`
- `region`
- `address`
- `description` (brief content/about the fellowship)

Featured image is intentionally excluded for this phase.

## Why This Matters
The current fellowship directory works visually, but the underlying fellowship data is still too thin. Right now most card content is inferred from name/state/region, which makes the public experience feel generic.

Adding address and a short description will make the directory:
- more trustworthy
- more useful for first-time visitors
- easier to maintain by state admins
- ready for later expansion into fellowship detail pages

## In Scope
1. Database/schema support for fellowship `address` and `description`
2. Backend API updates for fellowship create, update, list, and bulk upload compatibility
3. Admin fellowship form updates so editors can add/edit the richer data
4. Public fellowship directory updates to display the richer data when available
5. Graceful fallback behavior for old fellowship records without new fields

## Out of Scope
- Featured image upload
- Fellowship detail page
- Public contact person/phone fields
- Meeting schedule fields for this phase
- Map integration
- CSV/XLSX enrichment beyond basic compatibility unless needed for upload support

## Current State
### Existing fellowship schema
Current fellowship table stores only:
- `id`
- `name`
- `state`
- `region`
- timestamps

### Existing admin management
Current fellowship admin supports:
- add fellowship
- edit fellowship
- delete fellowship
- bulk upload with columns `name, state, region`

### Existing public usage
The public fellowship directory currently consumes fellowship records and generates descriptive fallback text because richer fields do not yet exist.

## Proposed Technical Changes

### 1. Database Changes
Extend `fellowship_centres` with:
- `address` TEXT or VARCHAR
- `description` TEXT

Recommended migration:
- add nullable columns first
- do not require backfilling immediately
- keep existing rows valid

### 2. Backend Changes
Update backend fellowship flows so both admin and public endpoints can read/write the new fields.

#### Endpoints impacted
- `/admin/fellowships`
- `/admin/fellowships/:id`
- `/admin/fellowships/bulk`
- `/meta/fellowships?rich=1`

#### Backend behavior
- existing rows with null/empty fields must still work
- public rich response should return:
  - `id`
  - `name`
  - `state`
  - `region`
  - `address`
  - `description`
- validation should allow empty `address` and `description` during transition, but admin UI should encourage filling them

### 3. Admin UI Changes
Update fellowship admin form to include:
- address field
- short description textarea/editor

#### Admin listing improvements
In the fellowship table, show at least:
- fellowship name
- state
- region
- address preview or indicator that address exists

### 4. Bulk Upload Compatibility
Keep current bulk upload working with the old format.

Recommended behavior:
- accept existing minimal sheet with `name, state, region`
- optionally support added columns later:
  - `address`
  - `description`
- do not break current upload templates

### 5. Public Directory Changes
Update the state fellowship directory page so it prefers stored fields when available.

#### Card display priority
- title: fellowship name
- description: saved `description`, else fallback-generated text
- location row: saved `address` if present, else region/state fallback
- meta/supporting context still derived from existing data where needed

## Data Strategy
### Backward Compatibility
All old records remain valid.

If enriched data is missing:
- address falls back to `region, state`
- description falls back to generated helper copy

This allows immediate deployment without blocking on mass data entry.

## Acceptance Criteria
1. Fellowship records can store `address` and `description`
2. Admin users can create and edit these fields
3. Existing fellowship records continue to function without migration failures
4. Public directory cards display stored address/description when present
5. Fallback content still works for unenriched records
6. Existing bulk upload flow does not break
7. Build passes and backend syntax/migration checks pass

## Risks / Notes
- Existing table rows will be partially enriched at first, so public cards will be mixed between real content and fallback content until admins update records
- If admin users need faster population, later we can add an enrichment upload template for address/description
- Description field should stay concise in UI to avoid card height inconsistency

## Recommendation
Proceed with a minimal but durable enrichment pass:
- add `address`
- add `description`
- wire admin editing
- wire public rendering
- keep all old records compatible

This gives the directory real substance without introducing unnecessary complexity.

## Build Output Expected After Approval
- migration file for fellowship enrichment
- backend CRUD updates for new fields
- admin fellowship form update
- public directory rendering update
- smoke test + release notes for the enrichment pass
