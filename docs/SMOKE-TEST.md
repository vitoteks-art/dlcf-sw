# SMOKE TEST - STATE-GALLERY-ADMIN

## Scope
Verify the dedicated admin-managed state gallery system and the public state gallery page using real gallery records.

## Build / Checks
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)
- Backend syntax: `php -l api/index.php` ✅

## Manual Smoke Checklist

### 1. Migration is applied
- Apply `scripts/migrations/20260421_state_gallery_items.sql`
- Confirm `state_gallery_items` table exists

### 2. Admin State Gallery tab appears
- Open Admin Dashboard
- Confirm `State Gallery` tab is visible for authorized users

### 3. Admin can create gallery item
- Open `State Gallery`
- Fill state, title, category, image, status
- Save item
- Confirm item appears in the admin list

### 4. Image upload works
- Use image upload field
- Confirm uploaded image URL populates the form
- Save successfully

### 5. Admin list filters work
- Filter by state
- Filter by status
- Filter by category
- Confirm results update correctly

### 6. Edit and delete work
- Edit an existing gallery item
- Confirm changes persist
- Delete an item
- Confirm it is removed from list

### 7. Public gallery route uses dedicated data
- Open `/:stateId/gallery`
- Confirm published gallery items for that state render
- Confirm page no longer depends on sermon/media records

### 8. Public category filters work
- Click category pills
- Confirm visible gallery cards filter in-place

### 9. Draft visibility works
- Save a gallery item as `draft`
- Confirm it does not appear on the public gallery page
- Change to `published`
- Confirm it appears publicly

## Notes
- Current lint output contains pre-existing warnings in the project and does not block this MVP.
- Gallery categories now come from dedicated gallery records instead of derived sermon/media metadata.
