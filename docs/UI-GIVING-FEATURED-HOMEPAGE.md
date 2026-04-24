# UI — GIVING-FEATURED-HOMEPAGE

## Goal
Add featured giving surfaces to the existing DLCF UI without changing the current public design language.

The UI should feel like a natural extension of the current premium public pages:
- same card language already used on media/publications/giving pages
- same homepage section rhythm
- same dark-gold premium hero system already in use

## Existing surfaces to extend
- Main homepage: `web/src/pages/PublicHome.jsx`
- State homepage: `web/src/pages/StateDetailPage.jsx`
- Giving listing: `web/src/pages/GivingListPage.jsx`
- Giving detail: `web/src/pages/GivingDetailPage.jsx`
- Admin giving manager: `web/src/components/admin/AdminGiving.jsx`

## UX principles
1. Homepage sections show **featured** campaigns only
2. Full give pages show **all** published campaigns for the relevant scope
3. State pages prioritize **state** campaigns first, then **zonal** campaigns
4. `Urgent` stays a visual priority badge, not the same thing as featured
5. No new visual style family should be invented; reuse current premium card/section patterns

---

## A. Admin UI

### A1. Admin Giving form
Location:
- Admin → Giving

### Add field
Add a checkbox directly near `Mark as urgent`:
- label: `Feature on homepage`
- helper text: `Featured campaigns appear on the main homepage or state homepage based on scope.`

### Field behavior
- Available on create and edit
- Can be checked for both zonal and state campaigns
- If `scope = state`, campaign can only appear on that state homepage featured section
- If `scope = zonal`, campaign can appear on main homepage and on state homepage zonal featured block

### Recommended placement
In the form, show a compact row of two toggles:
- `Mark as urgent`
- `Feature on homepage`

### Admin list table changes
Add a new column:
- `Featured`

Display:
- `Yes` badge if featured
- `—` if not featured

Optional nice enhancement:
- quick inline pill badges in title row:
  - `Urgent`
  - `Featured`

---

## B. Main homepage UI

Location:
- `PublicHome.jsx`

### New section
Insert a new homepage section called:
- kicker: `Featured Giving`
- title: `Support current zonal needs`
- body: short intro text about current zonal campaigns

### Placement recommendation
Place it after the homepage dashboard / events-announcements area and before lower resource/community sections.
This keeps it visible on the homepage without overpowering the hero.

### Section contents
Show up to 3 featured zonal campaigns.

Each card should include:
- cover image
- campaign type pill
- urgent badge if applicable
- title
- short summary
- raised / goal line
- progress bar
- CTA button: `View Campaign`

### Section footer CTA
- `View all giving` → `/give`

### Empty state
If no featured zonal campaigns exist:
- hide the section completely

### Visual treatment
Reuse current giving/publication card language:
- white premium cards on light section background
- existing progress bar styles
- existing `media-pill` / subtle badge styles

---

## C. State homepage UI

Location:
- `StateDetailPage.jsx`

### New giving surface on state homepage
Add a dedicated giving area with **two subsections**:

#### 1. State Featured Giving
- kicker: `State Giving`
- title: `Support needs in ${stateName}`
- shows featured state campaigns for that state only

#### 2. Zonal Featured Giving
- kicker: `Zonal Giving`
- title: `Support zonal initiatives`
- shows featured zonal campaigns

### Placement recommendation
Place this section after core state storytelling blocks (hero/about/worship) and before lower content sections like publications/contact.

### Card design
Use the same card pattern as the main homepage featured giving section.

### Ordering inside state page
1. state featured campaigns
2. zonal featured campaigns

This keeps local relevance first.

### Section CTA links
- State block CTA: `View all state giving` → `/:stateSlug/give`
- Zonal block CTA: `View all zonal giving` → `/give`

### Empty state behavior
- If no state featured campaigns exist, hide only the state block
- If no zonal featured campaigns exist, hide only the zonal block
- If neither exists, hide the full giving section

---

## D. Give listing pages

### D1. Main `/give`
Purpose:
- full zonal giving library

### Keep existing hero
Continue using current premium give hero.

### Add optional featured strip at top of list
Above the main grid, optionally show:
- `Featured campaigns` carousel/row or static grid of 1–3 featured zonal campaigns

This is optional; homepage is the primary featured surface.
If implemented, make sure it does not duplicate the whole page awkwardly.

### D2. State `/:stateSlug/give`
Purpose:
- full state giving library for that state

### Recommended behavior
Main list remains state-scoped.
Optional secondary block at the bottom:
- `Also support zonal initiatives`
- shows featured zonal campaigns only

This is useful, but lower priority than homepage support.

---

## E. Give detail pages

### Main detail `/give/:id`
No major redesign needed.
Keep current layout and add only small metadata improvements:
- `Featured` badge should NOT show publicly
- `Urgent` badge can continue showing
- preserve progress, summary, payment instructions

### State detail `/:stateSlug/give/:id`
Keep same layout.
Back link should respect scope:
- if on state route, back goes to `/:stateSlug/give`
- if on zonal route, back goes to `/give`

---

## F. Data-display rules in UI

### Featured logic
- Featured affects homepage visibility only
- Featured should not replace normal listing logic

### Urgent logic
- Urgent affects badge/highlight/order
- Urgent does not automatically place campaign on homepage

### Scope logic
- Zonal featured:
  - visible on main homepage
  - also visible on state homepage zonal block
- State featured:
  - visible only on matching state homepage

---

## G. Components to add or extract

### Recommended reusable component
Create a reusable public card component, e.g.
- `FeaturedGivingCard`

Props:
- `item`
- `href`
- `showScopeLabel?`
- `compact?`

### Recommended reusable section component
Optional:
- `FeaturedGivingSection`

Props:
- `title`
- `kicker`
- `items`
- `viewAllUrl`
- `emptyBehavior`

This will reduce duplication between main homepage and state homepage.

---

## H. Responsive behavior

### Mobile
- cards stack to single column
- section headers collapse neatly above CTA links
- progress lines remain visible
- no horizontal overflow

### Tablet/Desktop
- use 2–3 card grid depending on available space
- preserve current public-section spacing rhythm

---

## I. Copy recommendations

### Main homepage section copy
- kicker: `Featured Giving`
- title: `Support current zonal needs`
- body: `Stand with ongoing zonal projects, urgent support needs, and ministry initiatives making kingdom impact.`

### State homepage state block copy
- kicker: `State Giving`
- title: `Support needs in this state`
- body: `Partner with ongoing projects, urgent needs, and ministry support within this state.`

### State homepage zonal block copy
- kicker: `Zonal Giving`
- title: `Support zonal initiatives`
- body: `Also support wider zonal campaigns serving campuses and fellowship communities across the region.`

---

## J. Loading / empty / error states

### Loading
- render lightweight skeleton or existing loading-friendly card placeholders
- do not leave large empty gaps

### Error
- homepage featured sections should fail quietly
- if featured give fetch fails, homepage should still render normally

### Empty
- no section shown if there are no featured items for that block

---

## K. Definition of UI done
- Admin can see and use a `Feature on homepage` checkbox
- Admin list clearly indicates featured campaigns
- Main homepage shows featured zonal gives
- State homepage shows featured state gives and featured zonal gives
- Existing give listing/detail pages remain visually consistent
- Mobile layout remains clean and readable

## Approval request
If this matches your intended UI behavior, reply with:

`APPROVE UI GIVING-FEATURED-HOMEPAGE`
