# QA Report — DLCF-SW Content Standardization

Date: 2026-05-01
Project ID: DLCF-SW-CONTENT-STANDARDIZATION

## Verification run

- `php -l api/index.php` — PASSED
- `cd web && npm run build` — PASSED

## Implemented MVP scope

- Backend workflow statuses for media/publications: draft, submitted, changes_requested, approved, scheduled, published, archived, rejected.
- Backend role enforcement for publish authority: administrator, zonal coordinator/admin, state coordinator/admin.
- Work-unit users can contribute/review but cannot publish unless their main role permits it.
- State-scoped users are forced to their assigned state for content create/update/listing.
- Zonal users can manage zonal and state content.
- Public list/detail endpoints return only `published` + `public` content.
- Delete actions changed to archive/soft-delete behavior.
- Media/publication admin UIs now include workflow counts/tabs, filters, expanded forms, publish checklist, review notes, visibility, SEO fields, scheduling metadata, and archive actions.
- Public state/zonal media/publication listing filters now include search where missing.

## Migration required

Apply before using the new admin workflow fields:

`scripts/migrations/20260501_content_workflow.sql`

## Known notes

- Scheduled publishing stores `scheduled_at`; automatic background publishing can be added later if Victor wants posts to go live without manual publish.
- Existing uploaded content remains valid after migration; new metadata fields default safely.
