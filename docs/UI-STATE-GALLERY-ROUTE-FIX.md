# UI - STATE-GALLERY-ROUTE-FIX

## Objective
Correct the route separation so that:
- `/:stateId/media` remains the original state media page for sermons/audio/video
- `/:stateId/gallery` becomes the dedicated visual gallery page

This fixes the current mismatch where the gallery redesign replaced the media page.

## Approved Direction
- Restore the previous state media listing experience on `/:stateId/media`
- Move the newly built premium gallery experience to `/:stateId/gallery`
- Add `Gallery` into the public state navigation
- Keep both pages distinct in purpose and wording

## Route Model
### Media
- Route: `/:stateId/media`
- Purpose: sermons, messages, audio, video, media library

### Gallery
- Route: `/:stateId/gallery`
- Purpose: visual moments, event photos, outreach snapshots, worship moments, state visual storytelling

## Navigation Update
Update `StatePublicHeader` nav to include both:
- Media
- Gallery

Recommended order:
- Overview
- Fellowships
- Events
- Publications
- Media
- Gallery

## Media Page Behavior
Restore the former functional state media list UI:
- state media hero
- basic media listing cards
- type filter
- clear message/audio/video semantics
- existing link to state media detail page

This page should not use gallery-specific language like:
- Visual Testimony
- Moments of Grace & Glory
- gallery masonry terminology

## Gallery Page Behavior
Use the premium gallery page already built, but serve it as:
- `/:stateId/gallery`

### Gallery language should remain visual/editorial
Examples:
- Visual Testimony
- Moments of Grace & Glory
- Find moments
- masonry gallery layout

## Data Behavior
### Media page
Continue using current state media source exactly as before.

### Gallery page
For the immediate fix phase, it is acceptable to reuse the current media dataset as gallery input temporarily if there is no dedicated gallery backend yet, but the route and user-facing meaning must be separated clearly.

If later a dedicated gallery/image dataset is introduced, the page can swap its source without changing the public route.

## Acceptance Criteria
1. `/:stateId/media` is restored to media-specific meaning and UI
2. `/:stateId/gallery` serves the premium gallery experience
3. State header shows both `Media` and `Gallery`
4. Existing media detail links remain intact
5. No public route ambiguity remains between sermons/media and gallery
6. Build passes after the route split

## Implementation Note
Fastest safe correction:
- create new `StateGalleryPage.jsx` from the current premium gallery implementation
- restore `StateMediaListPage.jsx` to the prior media-list version
- wire `/:stateId/gallery` in app routing
- add nav entry in `StatePublicHeader`
