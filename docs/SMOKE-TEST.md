# SMOKE TEST - STATE-FELLOWSHIP-DIRECTORY

## Scope
Verify the new public State Fellowship Directory flow for DLCF-SW.

## Build / Checks
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)
- Backend syntax: `php -l api/index.php` ✅

## Manual Smoke Checklist

### 1. State fellowship route loads
- Open `/:stateId/fellowships`
- Confirm page renders without crash
- Confirm state header is visible
- Confirm page title and hero copy are state-specific

### 2. Search UI works
- Type a known school/town/centre keyword
- Confirm visible results filter immediately
- Clear the query
- Confirm full directory list returns

### 3. State-only data scope
- Open one state directory
- Confirm fellowships shown belong to that state only
- Open another state directory
- Confirm list changes to that state

### 4. Directory cards render correctly
- Confirm each card shows:
  - icon
  - type badge
  - fellowship name
  - description
  - location row
  - meeting row
  - CTA button

### 5. Empty state works
- Search for a nonsense term with no match
- Confirm polished empty state appears

### 6. State homepage linkage works
- Open a state homepage
- Click hero CTA / Find a Center action
- Confirm it routes to `/:stateId/fellowships`

### 7. State header navigation works
- From a state page, click `Fellowships`
- Confirm it opens the state fellowship directory

### 8. Backend rich fellowship response works
- Request `/api/meta/fellowships?state=<STATE>&rich=1`
- Confirm response returns objects with:
  - `id`
  - `name`
  - `state`
  - `region`

## Notes
- Current lint output contains pre-existing warnings in the project and does not block this MVP.
- Current fellowship records are still lightweight, so descriptions and schedules use graceful fallback text where richer public data is not yet stored.
