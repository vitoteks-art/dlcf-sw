# UI - FELLOWSHIP-DIRECTORY-DATA-ENRICHMENT

## Purpose
Define the UI changes needed to support richer fellowship data in both admin management and the public fellowship directory.

## Scope
Add UI support for these fellowship fields:
- `name`
- `state`
- `region`
- `address`
- `description`

No featured image in this phase.

## Surfaces Affected
1. Admin fellowship management form
2. Admin fellowship listing table
3. Public state fellowship directory cards

## Design Principle
Keep the current approved fellowship directory design language intact. This phase improves data richness, not the visual direction.

For admin, use the existing compact card/form/table style already present in the dashboard.

## 1. Admin Fellowship Form
### Existing Fields
- State
- Region
- Fellowship Name

### New Fields to Add
- Address
- Short Description / About

### Layout Recommendation
Use a compact but readable stacked form:
- row 1: State, Region, Fellowship Name
- row 2: Address (full width or half width depending on layout fit)
- row 3: Description textarea (full width)

### Field Behavior
#### Address
- text input
- placeholder example: `No. 12 Secretariat Road, Ogbomoso`
- optional during transition, but expected for new entries

#### Description
- textarea
- placeholder example: `A vibrant fellowship serving students and young professionals in the area.`
- keep plain text for now
- should support short, concise content rather than long essays

### Edit Mode
When editing a fellowship:
- existing address should preload
- existing description should preload
- cancel behavior remains unchanged

## 2. Admin Fellowship Listing Table
### Current Columns
- Fellowship Name
- State
- Region
- Actions

### Proposed Columns
- Fellowship Name
- State
- Region
- Address
- Description
- Actions

### Display Rules
#### Address column
- show one-line preview
- truncate if too long
- if empty, show muted dash or `Not set`

#### Description column
- show short preview, one line or two lines max
- truncate overflow
- if empty, show muted dash or `Not set`

This makes it easy for admins to see which fellowship records still need enrichment.

## 3. Bulk Upload Messaging
Keep current bulk upload UI working.

### Required columns display
Continue supporting:
- `name, state, region`

Optional note can be added later for:
- `address, description`

For this phase, the UI should not break existing upload expectations.

## 4. Public Fellowship Directory Cards
### Current State
Cards currently infer much of their content.

### New Display Priority
#### Title
- fellowship name

#### Description
- use saved `description` if present
- fallback to generated helper copy if absent

#### Location row
- use saved `address` if present
- fallback to `region, state` if absent

#### Meeting row
- keep current fallback or placeholder behavior for now

### Card Layout Impact
The current card design stays largely the same.
Only data binding changes so cards feel more real.

### Description Length Rule
Clamp visible description so cards stay visually balanced.
Recommended:
- 2 to 4 lines max depending on CSS treatment

### Address Length Rule
Clamp address to one or two lines in card layout.

## 5. Empty / Partial Data Handling
When a fellowship lacks some enriched fields:
- do not show broken layout
- show fallback location text when address is empty
- show fallback generated description when description is empty

This keeps the page polished even while enrichment is in progress.

## 6. Validation / Usability Guidance
### Admin form
- `name`, `state`, and `region` remain required
- `address` and `description` can be optional for compatibility, but should be visually encouraged

### Nice-to-have microcopy
Possible helper text:
- Address: `Use a clear physical location visitors can recognize.`
- Description: `Keep it short and welcoming.`

## 7. Responsiveness
### Admin
- New fields should stack naturally on smaller screens
- textarea remains full width on mobile

### Public directory
- enriched text should not break card heights excessively
- truncation/clamp rules should preserve grid neatness on mobile/tablet/desktop

## Acceptance Criteria
1. Admin users can add/edit address and description for fellowships
2. Admin table shows address/description status clearly
3. Public fellowship cards use saved address when available
4. Public fellowship cards use saved description when available
5. Missing enriched fields fall back gracefully
6. Existing approved directory design remains visually consistent
