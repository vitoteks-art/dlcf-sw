# SMOKE TEST - FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT

## Scope
Verify the fellowship enrichment pass that adds address and description to fellowship records across admin and public directory flows.

## Automated Checks
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)
- Backend syntax: `php -l api/index.php` ✅

## Migration Check
- Apply: `scripts/migrations/20260421_fellowship_directory_enrichment.sql`
- Confirm `fellowship_centres` now contains:
  - `address`
  - `description`

## Manual Smoke Checklist

### 1. Admin fellowship form
- Open Admin → Locations → Fellowships
- Confirm fields exist for:
  - State
  - Region
  - Fellowship Name
  - Address
  - Short Description / About

### 2. Admin create flow
- Create a new fellowship with address and description
- Confirm save succeeds
- Confirm fellowship appears in the table immediately

### 3. Admin edit flow
- Edit an existing fellowship
- Confirm existing address/description preload correctly
- Update one or both fields
- Confirm save succeeds and table reflects changes

### 4. Admin table display
- Confirm table shows:
  - fellowship name
  - state
  - region
  - address
  - description
- Confirm empty values display safely as `Not set`

### 5. Bulk upload compatibility
- Upload old-format sheet with `name, state, region`
- Confirm upload still succeeds
- Optional: upload sheet including `address, description`
- Confirm enrichment values save when provided

### 6. Public rich fellowship response
- Request `/api/meta/fellowships?state=<STATE>&rich=1`
- Confirm each item now returns:
  - `id`
  - `name`
  - `state`
  - `region`
  - `address`
  - `description`

### 7. Public directory display
- Open `/:stateId/fellowships`
- Confirm cards show saved `description` when available
- Confirm location row shows saved `address` when available
- Confirm cards still fall back gracefully for old records without enrichment

### 8. Regression check
- Confirm non-rich fellowship consumers still work where only fellowship names are expected
- Confirm admin attendance-code fellowship selection still loads successfully

## Notes
- Lint output still contains pre-existing project warnings and does not block this release.
- This pass keeps backward compatibility for existing fellowship records and old upload templates.
