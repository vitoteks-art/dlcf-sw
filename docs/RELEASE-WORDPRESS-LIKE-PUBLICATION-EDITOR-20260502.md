# Release Notes — WordPress-like Publication Editor Upgrade

Project ID: DLCF-SW-WORDPRESS-LIKE-PUBLICATION-EDITOR
Date: 2026-05-02

## Changed Files

- web/src/components/admin/AdminPublications.jsx
- web/src/components/RichTextEditor.jsx
- web/src/App.css
- docs/UI-WORDPRESS-LIKE-PUBLICATION-EDITOR-20260502.md
- docs/QA-WORDPRESS-LIKE-PUBLICATION-EDITOR-20260502.md

## Deployment Package

Frontend dist package:

- dlcf-sw-wordpress-publication-editor-frontend-dist-20260502-0919.zip

No backend package is required for this batch because it uses the existing upload/publication endpoints.

## Manual Smoke Test

1. Login as an admin or authorized publication manager.
2. Open Admin → Publications.
3. Click + New Publication.
4. Add title, category/type, excerpt, content, SEO fields, and scope.
5. Upload a featured image and confirm preview appears.
6. Use Add Media / Upload Image in the editor and confirm image appears inside content.
7. Save Draft.
8. Reopen/Edit the publication.
9. Preview publication.
10. Publish with a user that has publishing authority.
