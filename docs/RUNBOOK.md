# RUNBOOK — GIVING-FEATURED-HOMEPAGE

## Scope
Deploy the featured-giving expansion for DLCF-SW:
- admin `Feature on homepage` toggle for giving campaigns
- featured zonal giving on main homepage
- featured state giving + featured zonal giving on state homepages
- backend/API support for `is_featured`

## Files in this release
### Backend
- `api/index.php`
- `scripts/migrations/20260424_giving_featured_homepage.sql`
- `scripts/migrations/20260423_giving_campaigns.sql` (only if the giving table is not already present)

### Frontend
- rebuilt `web/dist/`

## Pre-deploy checklist
1. Confirm current site backup exists
2. Confirm database backup exists
3. Confirm you know whether `giving_campaigns` table already exists
4. Confirm frontend and backend are deployed from the same release batch

## Deploy order
### 1) Backend first
Upload/replace:
- `api/index.php`

### 2) Run DB migration
If `giving_campaigns` table already exists:
- run `scripts/migrations/20260424_giving_featured_homepage.sql`

If `giving_campaigns` table does **not** exist yet:
- run `scripts/migrations/20260423_giving_campaigns.sql`
- then run `scripts/migrations/20260424_giving_featured_homepage.sql`

### 3) Frontend
Upload built frontend files from `web/dist/` into the public frontend root.
Ensure:
- `index.html` is replaced
- `assets/` files are replaced
- SPA `.htaccess` remains intact

## Post-deploy smoke test
### Admin checks
1. Log in as admin/zonal_cord/zonal_admin/state_cord/state_admin
2. Open `Admin -> Giving`
3. Confirm `Feature on homepage` checkbox is visible
4. Create or edit a giving campaign
5. Set:
   - `status = published`
   - `is_featured = true`
6. Save and confirm the change persists in the table

### Main homepage checks
1. Open `/`
2. Confirm featured zonal giving section appears when zonal featured campaigns exist
3. Click a featured card
4. Confirm it opens `/give/:id`

### State homepage checks
1. Open `/:stateSlug`
2. Confirm featured state gives appear for matching state campaigns
3. Confirm featured zonal gives also appear
4. Click cards and verify routing:
   - state card -> `/:stateSlug/give/:id`
   - zonal card -> `/give/:id`

### Give page checks
1. Open `/give`
2. Confirm all zonal published campaigns still appear
3. Open `/:stateSlug/give`
4. Confirm state published campaigns still appear

## Functional healthcheck endpoints
Use these after deploy:
- `GET /api/giving-campaigns?scope=zonal&featured=1`
- `GET /api/giving-campaigns?scope=state&state=<STATE_NAME>&featured=1`

Expected:
- `200 OK`
- JSON response with `items`

## Rollback
### Frontend rollback
- Restore previous `public_html` frontend build files

### Backend rollback
- Restore previous `api/index.php`

### Database rollback
This release adds `is_featured` and its index.
If emergency rollback is required and code must be reverted, the safest path is:
- leave the added column in place
- revert application files only

If you must fully revert schema:
- drop index `giving_featured_idx`
- drop column `is_featured`

Use schema rollback only if necessary and after backup.

## Known notes
- Existing Vite large-chunk warning remains non-blocking
- Feature depends on campaigns being both `published` and `featured`
- `urgent` remains separate from `featured`
