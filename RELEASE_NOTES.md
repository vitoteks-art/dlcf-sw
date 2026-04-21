# RELEASE NOTES

## FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT

### Summary
Enriched fellowship records so the admin can maintain real address and about text, and the public fellowship directory can display richer, more useful fellowship information.

### Included
- Added fellowship `address` field
- Added fellowship `description` field
- Updated admin fellowship create/edit flows
- Updated admin fellowship table to show address and description
- Updated `/meta/fellowships?rich=1` to return address and description
- Updated public fellowship directory to prefer saved address/description over generated fallback copy
- Added schema and migration support for the new fields

### Files Added / Updated
- `scripts/schema.sql`
- `scripts/migrations/20260421_fellowship_directory_enrichment.sql`
- `api/index.php`
- `web/src/App.jsx`
- `web/src/components/admin/AdminLocations.jsx`
- `web/src/pages/StateFellowshipDirectoryPage.jsx`
- `docs/PLAN-FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT.md`
- `docs/UI-FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT.md`
- `docs/SMOKE-TEST-FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT.md`

### Validation
- `npm run build` passed
- `npm run lint` passed with warnings only
- `php -l api/index.php` passed

### Known Limits
- Existing fellowship records may still show fallback content until admins fill in address and description.
- Meeting schedule fields are still not part of this phase.

### Commits
- `8b4954b` - `Enrich fellowship directory data fields`
