# UI - STATE-GALLERY-ADMIN

## Objective
Create a dedicated admin experience for managing state gallery content, separate from sermons/media, and connect it to the public `/:stateId/gallery` page.

## Product Separation
### Media
- sermons
- audio messages
- video messages
- media library content

### Gallery
- photos
- outreach moments
- worship moments
- conference snapshots
- fellowship/community images

The UI must preserve this separation clearly in both admin language and public behavior.

## Admin Experience

### New Admin Section
Add a dedicated section in admin for gallery management.

Suggested label:
- `State Gallery`

This section should feel similar in quality and structure to existing admin content managers like media, publications, and state homepage editors.

## Admin Layout
Use a two-part layout:
1. **Gallery item form**
2. **Existing gallery items list**

## Gallery Item Form
### Fields
- State
- Title
- Caption / Description
- Category
- Image URL
- Image Upload
- Event Date
- Status (`draft` / `published`)

### Category Options
Lean initial options:
- Conference
- Outreach
- Worship
- Fellowship
- Campus
- Special

### Form Behavior
- supports create and edit mode
- image upload should populate the image URL field after upload
- state selection should follow the existing admin scope rules
- form should reset after save
- validation should prevent empty required fields

### Minimum Required Fields
- State
- Title
- Image
- Category
- Status

## Gallery Items List
### Display columns/cards
- thumbnail preview
- title
- category
- state
- event date
- status
- actions: edit / delete

### Filtering
MVP list filters:
- state
- status
- category (optional if easy)

## Public Gallery Page
Route remains:
- `/:stateId/gallery`

### Data source
The page should now read dedicated gallery items, not media items.

### Public content behavior
- show only `published` gallery items for the selected state
- use category pills driven by real gallery category values
- preserve premium masonry/editorial layout already approved
- clicking an item can remain non-detail for MVP if no detail page is needed yet, or open the image/lightbox later

## Empty States
### Admin empty state
If no gallery items exist:
- show a clean empty state encouraging first upload

### Public empty state
If no published gallery items exist:
- show polished placeholder state
- no broken layout

## Permissions
- zonal-level admins can manage across states where existing rules allow
- state-scoped admins should only manage their own state gallery items
- permissions should follow current project patterns

## Acceptance Criteria
1. Admin has a dedicated `State Gallery` section
2. Admin can create gallery items
3. Admin can edit gallery items
4. Admin can delete gallery items
5. Admin can upload gallery images
6. Public `/:stateId/gallery` uses dedicated gallery data
7. Public gallery filters use real category values
8. Media and Gallery remain clearly separate
9. Build and syntax checks pass

## UX Notes
- keep the admin flow lean and practical
- prioritize speed of content entry
- thumbnail preview is important
- wording should consistently say `Gallery`, not `Media`, in this feature
