# RELEASE NOTES

## GIVING-FEATURED-HOMEPAGE

### Summary
Extended the DLCF-SW giving system so featured campaigns can appear on homepage surfaces by scope.

### Included
- Added `is_featured` support for giving campaigns
- Added admin `Feature on homepage` toggle in Giving manager
- Added featured zonal giving section to main homepage
- Added featured state giving section to state homepages
- Added featured zonal giving section to state homepages
- Kept `/give` as the full zonal giving listing
- Kept `/:stateSlug/give` as the full state giving listing
- Preserved `urgent` as a separate priority badge/ordering signal

### Files Added / Updated
- `api/index.php`
- `scripts/schema.sql`
- `scripts/migrations/20260423_giving_campaigns.sql`
- `scripts/migrations/20260424_giving_featured_homepage.sql`
- `web/src/components/FeaturedGivingCard.jsx`
- `web/src/components/admin/AdminGiving.jsx`
- `web/src/pages/PublicHome.jsx`
- `web/src/pages/StateDetailPage.jsx`
- `web/src/App.css`
- `docs/PLAN-GIVING-FEATURED-HOMEPAGE.md`
- `docs/UI-GIVING-FEATURED-HOMEPAGE.md`
- `docs/RUNBOOK.md`

### Validation
- `php -l api/index.php` passed
- `cd web && npm run build` passed

### Known Limits
- Existing large frontend chunk warning remains non-blocking
- Homepage sections only show campaigns that are both `published` and `featured`
- State homepages show zonal featured campaigns in addition to matching state featured campaigns

### Commits
- `9fd09cd` - `Add featured giving homepage plan and UI spec`
- `59196dd` - `Implement featured giving homepage flow`

---

## STATE-GALLERY-ADMIN

### Summary
Built a dedicated admin-managed State Gallery system so gallery content is now properly separate from sermons/media. Admins can manage real gallery items per state, and the public `/:stateId/gallery` page now reads dedicated gallery records.

### Included
- Added dedicated `state_gallery_items` database table
- Added migration for state gallery items
- Added public gallery endpoint
- Added admin CRUD endpoints for state gallery items
- Added new `State Gallery` tab in Admin Dashboard
- Added admin form for gallery title, caption, category, image, date, state, status, and sort order
- Added image upload support for gallery items
- Updated public `/:stateId/gallery` page to use dedicated gallery records
- Kept Media and Gallery fully separate

### Files Added / Updated
- `scripts/schema.sql`
- `scripts/migrations/20260421_state_gallery_items.sql`
- `api/index.php`
- `web/src/components/admin/AdminStateGallery.jsx`
- `web/src/pages/AdminPage.jsx`
- `web/src/pages/StateGalleryPage.jsx`
- `web/src/App.jsx`
- `docs/PLAN-STATE-GALLERY-ADMIN.md`
- `docs/UI-STATE-GALLERY-ADMIN.md`
- `docs/SMOKE-TEST.md`

### Validation
- `npm run build` passed
- `npm run lint` passed with warnings only
- `php -l api/index.php` passed

### Known Limits
- Existing large frontend chunk warning remains non-blocking.
- No bulk gallery upload in this phase.
- No drag-and-drop ordering in this phase.

### Commits
- `ce5cef2` - `Split state gallery from media route`
