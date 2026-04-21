# PLAN - STATE-FELLOWSHIP-DIRECTORY

## Goal
Create a polished public **State Fellowship Directory** page where visitors can search for fellowship centres within a state, browse available fellowships, and quickly see the most relevant centre for their school, town, or area.

## UI Standard
Use this as the direct design standard and implementation reference:
- `dlcf-sw/docs/dlcf-state-design/stitch_dlcf_oyo_homepage/code.html`

The implemented page should match that visual language closely, including:
- premium hero layout
- oversized headline treatment
- search-first experience
- soft light background with white cards
- strong Montserrat headings
- polished directory cards with icons/tags/meta rows
- featured map/stat band feel

## In Scope
1. Public **state fellowship directory page**
2. Search/filter by fellowship name, school, city, town, or area
3. Display fellowships belonging to the selected state
4. Show key fellowship details in card format
5. Reuse current DLCF state/public navigation style while aligning page visuals to the provided UI reference
6. Link users from state homepage/community section into this directory

## Out of Scope
- New database tables for this phase
- Google Maps API integration
- Fellowship profile detail page
- Admin redesign for fellowship management
- Advanced geolocation or distance-based sorting
- Backend schema migration unless current data proves insufficient

## Existing System Reuse
Current codebase already has:
- fellowship centres stored in `fellowship_centres`
- public/frontend access to fellowship lists through `/meta/fellowships`
- state-based content pages and state routes
- admin management for states, regions, and fellowships

This means the first version should be built mainly by extending the existing public pages and, if needed, adding a richer read endpoint for fellowship directory cards.

## Proposed User Experience

### Page Entry
Visitors can open the directory from:
- a state homepage CTA such as **Find a Centre**
- a direct route for a specific state

### Hero Section
Top of page includes:
- section eyebrow like `Find Your Community`
- title like `Fellowship Directory`
- state-specific supporting text
- prominent search box on the right/top area

### Map/Highlight Band
A visual section under the hero should show:
- a polished map/cover area or state visual block
- active fellowship count for that state
- subtle premium treatment matching the reference UI

### Directory Grid
Each fellowship card should show:
- fellowship name
- badge/type, for example campus centre or town fellowship
- short description or generated helper text if none exists
- location line
- meeting schedule line if available, otherwise graceful placeholder
- action button such as `Get Directions` or `View Centre`

### Search Behavior
User can search by:
- fellowship name
- institution/school
- town/city/area
- region name if helpful

Results should update on-page without reload.

### Empty State
If no result matches:
- show a polished empty state
- encourage trying another school, town, or area
- optionally keep suggested fellowships visible

## Technical Plan

### Frontend
Create a dedicated public page, likely one of:
- `web/src/pages/StateFellowshipDirectoryPage.jsx`
- or an equivalent route component following the current state page conventions

Add route support so users can visit something like:
- `/:stateId/fellowships`

Frontend responsibilities:
- fetch fellowship list for selected state
- maintain search query state
- derive filtered directory results client-side
- render the premium UI to closely match the provided HTML reference

### Backend
Preferred approach:
- reuse existing fellowship data source if enough fields are available

If current `/meta/fellowships` only returns names, add a richer public endpoint such as:
- `/public/state-fellowships.php?slug=<state>`

Preferred response fields:
- `id`
- `name`
- `state`
- `region`
- `type` (derived if needed)
- `institution` or school name if inferable/available
- `location_label`
- `meeting_schedule`
- `description`

If some of these fields do not yet exist in DB, MVP can still ship using graceful fallbacks derived from existing `name/state/region` data.

## Data Strategy

### MVP Data Source
Use existing `fellowship_centres` records.

### MVP Field Handling
Because current schema appears minimal, the first pass can derive display content like this:
- `name` from fellowship centre name
- `location` from region + state
- `type` inferred from keywords like university, polytechnic, college, campus, town, etc.
- `description` generated from name/type/region when no stored description exists
- `meeting_schedule` optional placeholder until richer data is available

### Future Upgrade Path
Later we can extend fellowship centres with optional public profile fields:
- `centre_type`
- `institution_name`
- `address`
- `meeting_days`
- `meeting_time`
- `hero_image`
- `public_description`
- `map_url`
- `contact_phone`

That upgrade is intentionally not required for MVP.

## Routes
Proposed public route:
- `/:stateId/fellowships`

Potential supporting links:
- from state homepage community CTA
- from state header nav where appropriate

## Acceptance Criteria
1. A public visitor can open a state fellowship directory page
2. The page visually aligns closely with the provided reference HTML
3. The page lists fellowships for the chosen state only
4. The search input filters fellowships instantly on the page
5. Each result card shows meaningful location/context even when data is incomplete
6. The page has polished loading and empty states
7. The state homepage can link into the directory
8. Build passes successfully after implementation

## Risks / Notes
- Current fellowship data may be too thin for full card richness, so fallback copy will be needed in MVP
- If `/meta/fellowships` only returns names, a small backend read endpoint will likely be needed
- Matching the provided UI literally is important, not just “inspired by”

## Recommendation
Proceed with:
1. a dedicated public state fellowship directory route
2. a lightweight public backend endpoint returning state fellowship records
3. a close implementation of the provided UI reference
4. fallback-generated card metadata where the DB lacks richer content

## Build Output Expected After Approval
- route + page component
- supporting API read endpoint if required
- styling aligned to provided reference
- homepage CTA linkage into directory
- verified frontend build
