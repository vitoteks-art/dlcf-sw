# UI - STATE-GALLERY-PAGE

## Approved Design Standard
Use this reference as the direct implementation target:
- `dlcf-sw/docs/dlcf-state-design/stitch_dlcf_oyo_gallery/code.html`

This is not just inspiration. The state gallery page should follow the same visual structure, layout rhythm, typography feel, filter treatment, masonry presentation, and CTA section as closely as practical.

## Route
- `/:stateId/media`

## Page Purpose
Present state media in a rich editorial gallery format that feels premium, visual, and emotionally engaging while still connecting into the current DLCF media detail flow.

## Visual Language
- soft light background
- deep blue primary headlines
- warm tertiary/gold accent for emphasis
- Montserrat/Manrope headline feel
- Inter body text
- generous white space and editorial spacing
- white and soft-surface cards with subtle shadows
- rounded corners throughout

## Page Structure

### 1. Header / Navigation Context
Reuse the current state public header, but the page itself should sit visually in the same premium family as the approved reference.

## 2. Hero Section
### Layout
Large editorial hero with:
- eyebrow label
- oversized multi-line headline
- state-specific supporting paragraph
- subtle decorative background treatment

### Content Direction
Eyebrow:
- `Visual Testimony`

Headline pattern:
- `Moments of`
- accented second line: `Grace & Glory`

Supporting copy:
- should reference the selected state naturally

## 3. Filter Pills Row
Below hero, add rounded category/filter pills.

### MVP Filters
- `All Moments`
- derived category pills from current media data

Likely examples:
- Conferences
- Outreach
- Worship
- Fellowship
- Audio
- Video

### Behavior
- active pill has strong filled treatment
- inactive pills use soft-surface background
- clicking a pill filters visible items in-place

## 4. Gallery Layout
### Core Style
Use a masonry/editorial collage treatment similar to the reference.

### Item Types
Primary item type for MVP:
- media image card using `thumbnail_url`

Optional decorative variation when useful:
- text highlight card or promo card, but only if it does not weaken clarity

### Media Card Content
Each gallery item should support:
- large thumbnail or visual block
- title
- short metadata line
- hover state or overlay treatment where appropriate
- click-through to existing media detail page

### Metadata Priority
Use current available fields in this order where relevant:
- title
- speaker
- series
- event_date
- description
- media_type
- tags

## 5. No-Thumbnail Fallback
If a media item has no thumbnail:
- show a designed placeholder card
- keep the layout premium, not broken
- use icon + text treatment consistent with the design system

## 6. Empty State
If no state media exists:
- show a polished empty panel in the same visual language
- copy example:
  - title: `No gallery moments yet`
  - body: `Check back soon for worship, outreach, and conference moments from this state.`

## 7. CTA Section
Bottom CTA section should mirror the spirit of the reference:
- bold heading
- supportive text
- prominent CTA button

Suggested content:
- heading: `Have a moment to share?`
- CTA: `Submit Media`

Button can remain a placeholder or safe route until the full contribution flow exists.

## 8. Responsiveness
### Desktop
- editorial hero breathing room
- multi-column masonry layout
- wide pill row

### Tablet
- 2-column masonry feel
- filters wrap naturally

### Mobile
- single column stack
- large but scaled headline
- pills remain readable and scroll/wrap cleanly

## Interaction Rules
### Filtering
- filter instantly on click
- no full page reload
- `All Moments` resets the gallery

### Card Click Behavior
- clicking a media card opens the current state media detail page

### Hover Behavior
- subtle scale / shadow / overlay transition only
- keep motion refined, not noisy

## Content Rules
- titles should stay prominent
- descriptions in gallery should be short or selectively shown
- metadata should not clutter the cards
- visual hierarchy should prioritize image + title first

## Acceptance Criteria
1. State media page matches the approved gallery reference closely
2. Editorial hero is implemented
3. Filter pills exist and work in-page
4. Media items render in a masonry-style premium gallery layout
5. No-thumbnail items have graceful premium fallback cards
6. Clicking an item still leads to the existing media detail page
7. Empty state and CTA section are polished
8. Responsive behavior is strong across screen sizes
