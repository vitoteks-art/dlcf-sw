# DLCF-SW Retreat Biodata Autofill UI Spec

## Project ID
`DLCF-SW-RETREAT-BIODATA-AUTOFILL`

## Goal
Make biodata lookup inside retreat registration behave like a true autofill assistant instead of a simple search list.

## User Flow
1. Registration officer opens Retreat Registration page.
2. Officer searches for an existing participant by name, email, or phone in `Lookup Biodata`.
3. Matching biodata records appear.
4. Officer clicks a result.
5. Retreat form immediately fills the participant's relevant details.
6. Officer only adjusts retreat-specific fields if needed and submits.

## Screen Area: Lookup Biodata Card

### Current issue
Lookup results appear, but the selected biodata does not fully achieve the intended form autofill outcome.

### Required behavior
When a result is clicked:
- populate retreat form fields immediately
- close/clear the result list after apply
- show short success feedback

Suggested feedback:
- `Biodata loaded into the retreat form.`

## Autofill Field Mapping

### Fill these form fields from biodata
- Full Name
- Gender
- Email
- Phone
- Category
- Membership Status
- State
- Region
- Cluster
- Fellowship Centre

### Keep these fields unchanged
- Retreat
- Registration Date
- Title

Reason:
These are retreat-specific operator choices and should not be overwritten by biodata lookup.

## Dependent Dropdown Behavior
Because the retreat form has chained fields, autofill should preserve consistency.

### Required sequence behavior
If selected biodata contains:
- `state`
- `region`
- `fellowship_centre`
- `cluster`

Then the form must reflect them coherently after autofill.

Expected UI outcome:
- state shows the biodata state
- region shows the biodata region
- fellowship centre shows the biodata centre
- cluster shows the biodata cluster if available

If cluster is absent in biodata:
- leave cluster blank
- do not block autofill of the other fields

## Lookup Result Row Design
Each result row should still show compact identity info, for example:
- full name
- phone or email
- optional state/region context if helpful

Click action:
- one tap/click fills the form

No extra confirmation modal needed for MVP.

## Validation / Edge Cases
- if lookup result lacks some fields, fill only what exists
- do not erase retreat-specific fields when biodata is applied
- if state/region/centre mismatch causes downstream options to refresh, final rendered values should still match the chosen biodata where valid
- if a field cannot be applied, do not crash the form

## UX Acceptance Criteria
- biodata search still works
- selecting a result fills the retreat form immediately
- name, gender, email, phone, category, membership status, state, region, fellowship centre, and cluster are applied when available
- retreat type, title, and registration date remain unchanged
- lookup results clear after apply
- success feedback is shown after autofill
