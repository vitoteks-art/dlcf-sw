# Release Notes — DLCF-SW Content Standardization

Date: 2026-05-01
Project ID: DLCF-SW-CONTENT-STANDARDIZATION

## Added

- Standard publication/media workflow across admin screens.
- Workflow statuses: draft, submitted, changes_requested, approved, scheduled, published, archived, rejected.
- Role-aware publish permissions.
- State-scope enforcement for state admins/coordinators.
- Visibility model: public, members, leaders, private.
- SEO fields, review notes, featured flag, pinned-until, scheduled-at, archive metadata.
- Publish checklist validation before approve/publish/schedule.
- Search/filter controls on admin and public listing screens.

## Changed

- Media/publication delete actions now archive instead of hard-deleting.
- Public endpoints only expose published public content.
- State-scoped users cannot create zonal content or select another state.

## Deployment order

1. Back up database.
2. Upload backend files.
3. Apply `scripts/migrations/20260501_content_workflow.sql`.
4. Upload frontend `dist/` build.
5. Smoke test admin media/publications and public media/publications pages.
