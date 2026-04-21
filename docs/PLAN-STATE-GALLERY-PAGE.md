# PLAN - STATE-GALLERY-PAGE

## Goal
Create a premium public **State Gallery Page** for each state, using the provided gallery reference as the direct UI target, so visitors can browse media moments from the state in a visually rich masonry-style gallery experience.

## UI Standard
Use this file as the implementation reference:
- `dlcf-sw/docs/dlcf-state-design/stitch_dlcf_oyo_gallery/code.html`

This page should match the reference closely in:
- editorial hero layout
- premium typography and spacing
- category pill filters
- masonry / collage-style gallery presentation
- polished CTA section
- overall visual tone consistent with the state design system already approved

## In Scope
1. Upgrade the public state gallery/media listing page
2. Use the approved gallery UI as the direct visual standard
3. Display published state media items in a more premium visual layout
4. Support filtering by media-related categories/types where current data allows
5. Keep links into media detail pages where appropriate
6. Keep the page responsive across mobile, tablet, and desktop

## Out of Scope
- New database schema for media gallery categories in this phase
- Dedicated image-only upload system
- Video gallery detail redesign
- New admin media workflow
- Infinite scroll or advanced pagination unless current dataset requires it

## Current System Reuse
Current codebase already has:
- `StateMediaListPage.jsx`
- public `/media-items` endpoint
- published media items with fields like:
  - `title`
  - `description`
  - `speaker`
  - `series`
  - `media_type`
  - `thumbnail_url`
  - `event_date`
  - `tags`
  - `state`
  - `scope`
- media detail page routing already present

This means the MVP can primarily be a frontend redesign with light filtering logic over the current media response.

## Proposed User Experience

### 1. Hero Section
Top of page should mirror the reference:
- eyebrow label like `Visual Testimony`
- large editorial headline like `Moments of Grace & Glory`
- elegant supporting copy specific to the selected state

### 2. Filter Pill Row
Below the hero, show filter pills such as:
- All Moments
- Conferences
- Outreach
- Worship
- Fellowship

MVP behavior:
- derive filters from media tags/series/type where possible
- if exact taxonomy is not present, provide sensible derived filters from available fields

### 3. Gallery Layout
Main gallery should use a masonry-like, collage-rich presentation inspired by the reference.

Gallery items may include:
- large image cards using `thumbnail_url`
- media cards with title + location/date context
- occasional styled text/quote/promo block if needed for layout richness, but only if it can be done cleanly

Each media card should ideally show:
- thumbnail
- title
- subtitle/meta line
- hover treatment or click action to media detail page

### 4. Empty State
If no state media exists:
- show a polished empty state in the same visual language
- encourage users to check back for future uploads

### 5. CTA Section
Bottom CTA band/section similar to the reference:
- inviting copy for contribution or engagement
- CTA such as `Submit Media` or equivalent safe placeholder button

## Technical Plan

### Frontend
Primary target:
- redesign `web/src/pages/StateMediaListPage.jsx`

Likely additions:
- new gallery-specific CSS file, or extend existing premium state styling
- helper functions for derived categories and meta labels
- masonry grid implementation using CSS columns or responsive grid treatment

### Backend
Preferred MVP approach:
- reuse existing `/media-items` endpoint without schema change

No backend change is required unless we discover missing fields that block the page.

## Data Strategy
Use current published media item fields:
- `thumbnail_url` for visual cards
- `title` for main card title
- `description` for supporting context when useful
- `speaker`, `series`, `event_date`, `tags`, `media_type` for derived labels and filters

### Category Derivation Strategy
Possible mapping order:
1. explicit tags if present
2. series/title keywords
3. media_type fallback
4. default `All Moments`

This allows a refined UI without introducing a new admin taxonomy immediately.

## Route
Continue using current state media route:
- `/:stateId/media`

No route change needed, only page redesign.

## Acceptance Criteria
1. State media page visually matches the provided gallery reference closely
2. Page uses masonry/editorial gallery presentation
3. Media filter pills work sensibly with current data
4. Each gallery item links to the existing state media detail page when appropriate
5. Empty state is polished
6. Responsive behavior is solid on mobile/tablet/desktop
7. Existing media data source continues to work without breaking API compatibility

## Risks / Notes
- Current media taxonomy may be too loose for perfect category filters, so MVP filter labels may be partly derived
- Some media items may lack thumbnails, so graceful fallback card treatment is needed
- The implementation should match the provided UI literally where practical, not merely be inspired by it

## Recommendation
Proceed as a frontend-led redesign first:
- keep the existing route and backend response
- transform the state media page into the approved premium gallery experience
- add derived category filters and polished fallbacks

## Build Output Expected After Approval
- redesigned `StateMediaListPage`
- gallery-specific styling
- responsive masonry layout
- preserved media detail linkage
- build verification artifacts at MVP READY gate
