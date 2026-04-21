# PLAN - STATE-GALLERY-ADMIN

## Goal
Build a **dedicated admin-managed State Gallery system** so each state can add, edit, publish, and remove gallery items from a proper gallery management area, and the public `/:stateId/gallery` page will read from gallery records instead of reusing sermon/media items.

## Problem Being Solved
Current situation:
- the public gallery route now exists conceptually
- but there is **no dedicated place in admin** to manage gallery content
- the public gallery is temporarily forced to reuse media items, which is the wrong content model

We need a clean separation:
- **Media** = sermons, audio, video, messages
- **Gallery** = photos, visual moments, outreach/event snapshots, worship moments

## In Scope
1. Create dedicated database storage for gallery items
2. Create backend admin CRUD for gallery items
3. Create public gallery read endpoint(s)
4. Create admin UI for managing gallery items
5. Support image upload and image URL entry
6. Support state scoping for gallery items
7. Update public `/:stateId/gallery` page to read real gallery data
8. Support publish/draft states

## Out of Scope
- bulk gallery upload in this phase
- drag-and-drop reordering system in this phase
- gallery albums/nested collections in this phase
- video gallery management in this phase
- advanced moderation workflow in this phase

## Recommended Data Model
Create a dedicated table, for example:
- `state_gallery_items`

### Proposed fields
- `id`
- `state_id` or `state` (align with existing project conventions)
- `title`
- `caption`
- `image_url`
- `category`
- `event_date`
- `status` (`draft` / `published`)
- `sort_order` (optional but useful)
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

## Recommended Categories
Lean initial set:
- conference
- outreach
- worship
- fellowship
- campus
- special

These categories should power the public gallery filter pills directly instead of relying on derived guessing.

## Backend Plan
### Admin endpoints
Add endpoints similar to the project’s existing admin content patterns:
- `GET /admin/state-gallery-items`
- `POST /admin/state-gallery-items`
- `PUT /admin/state-gallery-items/:id`
- `DELETE /admin/state-gallery-items/:id`

### Public endpoint
Add a public endpoint, for example:
- `GET /state-gallery-items?state=<STATE>`

Public response should return only `published` items for the requested state.

## Admin UI Plan
### New Admin Section
Add a dedicated gallery management UI in admin, likely alongside other content sections.

### Form fields
- state
- title
- caption
- category
- image URL
- image upload
- event date
- status

### Listing table/cards
Show existing gallery items with:
- preview thumbnail
- title
- category
- state
- status
- date
- edit/delete actions

## Public UI Plan
Public route remains:
- `/:stateId/gallery`

But instead of reading sermon/media data, it will read dedicated gallery records.

### Public behavior
- show only published gallery items for that state
- filter pills map directly to gallery categories
- masonry/editorial layout remains
- if no items exist, show polished empty state

## Permissions
Use the existing admin/state-admin permission model:
- zonal admins can manage broader content
- state admins should manage gallery for their own state only, consistent with existing patterns

## Why This Is The Right Approach
This gives Victor the dedicated place he asked for and preserves a clean product model:
- no confusion between sermons/media and gallery
- no hacky content reuse
- clear admin workflow
- future-ready for richer gallery features later

## Acceptance Criteria
1. Admin has a dedicated section to manage gallery items
2. Admin can create, edit, and delete gallery items
3. Admin can upload/select gallery images
4. Gallery items are state-scoped
5. Public `/:stateId/gallery` reads only dedicated gallery records
6. Public gallery filter pills use real category data
7. Draft/published visibility works correctly
8. Build and syntax checks pass

## Migration / Deployment Note
This feature will require:
- schema update
- migration SQL
- backend deploy
- frontend deploy

## Recommendation
Proceed with a lean but proper gallery system now:
- dedicated table
- dedicated admin CRUD
- dedicated public data source
- keep UI premium, but keep data model simple
