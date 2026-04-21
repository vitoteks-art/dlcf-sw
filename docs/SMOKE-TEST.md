# SMOKE TEST - STATE-GALLERY-PAGE

## Scope
Verify the redesigned public State Gallery Page flow for DLCF-SW.

## Build / Checks
- Frontend build: `npm run build` ✅
- Frontend lint: `npm run lint` ✅ (warnings only, no blocking errors)
- Backend syntax: `php -l api/index.php` ✅

## Manual Smoke Checklist

### 1. State gallery route loads
- Open `/:stateId/media`
- Confirm page renders without crash
- Confirm state header is visible
- Confirm editorial hero is visible and state-specific

### 2. Search UI works
- Type a known title / speaker / series / keyword
- Confirm visible gallery items filter immediately
- Clear the query
- Confirm full gallery list returns

### 3. Filter pills work
- Click `All Moments`
- Click available category pills like `Conferences`, `Outreach`, `Worship`, `Fellowship`, `Audio`, or `Video`
- Confirm the visible gallery updates in-place without reload

### 4. Masonry gallery renders correctly
- Confirm cards render in a masonry-style multi-column layout on desktop
- Confirm cards stack cleanly on mobile
- Confirm visual hierarchy matches the approved gallery style closely

### 5. Media cards behave correctly
- Confirm items with thumbnails show image-led cards
- Confirm cards display title and meta text
- Click a card
- Confirm it routes to `/:stateId/media/:id`

### 6. No-thumbnail fallback works
- Confirm items without thumbnails render a polished placeholder card
- Confirm the layout does not break

### 7. Empty state works
- Search for a nonsense term with no match
- Confirm polished empty state appears

### 8. CTA section renders
- Scroll to the bottom CTA section
- Confirm heading, supporting copy, and CTA button are visible

## Notes
- Current lint output contains pre-existing warnings in the project and does not block this MVP.
- Category filters are derived from current media fields (`tags`, `series`, `title`, `description`, `speaker`, `media_type`) for this phase.
