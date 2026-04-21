# RELEASE NOTES

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
