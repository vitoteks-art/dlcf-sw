# UI - STATE-FELLOWSHIP-DIRECTORY

## Approved Design Standard
Use this reference as the direct implementation target:
- `dlcf-sw/docs/dlcf-state-design/stitch_dlcf_oyo_homepage/code.html`

This is not just inspiration. The page should follow the same visual structure, hierarchy, density, typography feel, and card treatment as closely as practical inside the current DLCF frontend.

## Route
- `/:stateId/fellowships`

## Page Purpose
Help visitors find the right DLCF fellowship centre within a state through a polished, search-first directory experience.

## Visual Language
- Background: soft light neutral (`#f7f9fc` family)
- Primary color: deep blue (`#002659` family)
- Secondary text: muted slate/blue
- Accent: warm gold/tertiary for badges and emphasis
- Typography:
  - headlines: Montserrat/Manrope style, bold to extra-bold
  - body: clean sans serif, light and readable
- Surface style:
  - white cards
  - soft shadows
  - large rounded corners
  - generous spacing
- Motion:
  - subtle hover lift on cards
  - soft button transitions
  - no heavy animation clutter

## Page Structure

### 1. Top Navigation / Header Context
Use current DLCF public navigation shell, but the fellowship directory page should visually sit in the same premium family as the reference.

Expected nav behavior:
- state/site identity visible
- fellowship-related nav item can appear active if state nav supports it
- CTA button remains visible

## 2. Hero Section
### Layout
Two-column desktop layout, stacked on mobile:
- left: eyebrow, headline, intro copy
- right: prominent search input

### Content
- Eyebrow: `Find Your Community`
- Headline treatment:
  - line 1: `Fellowship`
  - line 2 accent: `Directory`
- Supporting text references the selected state

### Search Box
Prominent rounded search field with left icon.

Placeholder:
- `Search by school or town...`

Behavior:
- filter results live as user types
- debounce optional but not required for MVP if filtering client-side

## 3. Featured Map / Highlight Section
A visual showcase block directly below hero.

### Structure
- large rounded container
- soft map/cover visual background
- subtle overlay gradient
- floating status pill near lower-left area

### Content
Status pill text example:
- `Showing 24 Active Fellowships in Oyo State`

### Data behavior
- count should reflect actual visible state fellowship count if possible
- if no custom map image exists, use a graceful visual placeholder area consistent with the style

## 4. Directory Grid Section
### Grid
- desktop: 3 columns
- tablet: 2 columns
- mobile: 1 column
- generous gaps between cards

### Card Design
Each card should follow the premium reference pattern:
- white background
- rounded large corners
- shadow
- top icon badge area
- small type badge/tag on the right/top
- strong title
- short supporting description
- two metadata rows
- bottom CTA button

### Card Content Fields
Each fellowship card should display:
1. icon based on inferred type
2. badge/type text
   - examples: `Campus Centre`, `Town Fellowship`, `New Center`
3. fellowship name
4. short description
5. location row with icon
6. meeting row with icon
7. CTA button

### Card CTA
Preferred button labels:
- `Get Directions`
- fallback: `View Centre`

### Card Type Rules
Infer from fellowship name where data is missing:
- contains university/polytechnic/college/campus/institute → `Campus Centre`
- contains town/city or lacks school indicators → `Town Fellowship`
- optionally highlight recently added centres if such data exists, otherwise skip `New Center`

### Icons
Use Material Symbols consistent with the reference:
- `school` for campus
- `church`, `home`, or `location_city` for town/community
- `hub` or similar when highlighting a notable centre

## 5. Empty State
When no fellowships match the query:
- show a refined empty panel in the same visual language
- copy example:
  - title: `No fellowship found yet`
  - body: `Try another school, city, or area. Nearby fellowship centres will appear when available.`

Optional:
- keep a few suggested fellowships below the empty state if data exists

## 6. Loading State
Before results load:
- show soft skeleton cards or simple polished loading placeholders
- maintain page layout stability

## 7. Error State
If data fetch fails:
- show a friendly, polished status card
- avoid raw API error dumps in the public UI
- include retry option if practical

## Interaction Details

### Search Matching
Match against:
- fellowship name
- institution/school name if present
- region name
- state name
- any derived display location string

### Sorting
Default sort recommendation:
1. exact/strong search matches first when query exists
2. otherwise alphabetical by fellowship name

### Button Actions
If map URL or location link exists:
- CTA goes to external directions link

If not:
- CTA can point to a simple view state/contact fallback or disabled-safe action

## Responsiveness
### Desktop
- strong editorial spacing
- search field aligned to hero right side
- 3-card grid

### Tablet
- hero stacks or compresses gracefully
- 2-card grid

### Mobile
- headline scales down
- search field full width
- single-column cards
- spacing remains airy, not cramped

## Copy Tone
- warm, welcoming, modern, spiritually grounded
- concise and polished
- avoid stiff institutional wording

## Reusable Styling Guidance
Prefer extending the existing premium state page style system so this new page feels native to DLCF while matching the provided reference.

Likely additions:
- directory-specific hero styles
- directory card styles
- map/highlight styles
- search input styles
- empty/loading state styles

## Implementation Notes
- Reuse current state slug resolution conventions from state public pages
- Reuse current public header/footer where possible
- Match the reference HTML structure closely rather than loosely approximating it
- If data is thin, use graceful generated descriptions instead of leaving cards bare

## Acceptance Criteria
1. Route `/:stateId/fellowships` exists
2. Hero matches the approved reference style closely
3. Search input is prominent and functional
4. Highlight/map section exists
5. Fellowship cards visually follow the provided design language closely
6. Grid is responsive across desktop/tablet/mobile
7. Empty/loading/error states are polished
8. Page feels like the same design family as the provided reference HTML
