# RELEASE NOTES

## STATE-FELLOWSHIP-DIRECTORY

### Summary
Added a new public State Fellowship Directory experience for DLCF-SW, designed to match the approved premium state UI reference.

### Included
- New public route: `/:stateId/fellowships`
- Search-first fellowship directory page
- Responsive premium card grid for state fellowships
- State homepage CTA now links to the fellowship directory
- State public header now includes a `Fellowships` navigation link
- Backend fellowship metadata endpoint now supports `rich=1` for directory-friendly responses

### Files Added / Updated
- `api/index.php`
- `web/src/App.jsx`
- `web/src/components/StatePublicHeader.jsx`
- `web/src/pages/StateDetailPage.jsx`
- `web/src/pages/StateFellowshipDirectoryPage.jsx`
- `web/src/state-fellowship-directory.css`
- `docs/PLAN-STATE-FELLOWSHIP-DIRECTORY.md`
- `docs/UI-STATE-FELLOWSHIP-DIRECTORY.md`
- `docs/SMOKE-TEST.md`

### Validation
- `npm run build` passed
- `npm run lint` passed with warnings only
- `php -l api/index.php` passed

### Known Limits
- Fellowship records currently expose limited public metadata, so some directory copy is generated from existing name/state/region values.
- Meeting schedules and deeper profile details can be enriched in a later phase if you want fuller fellowship cards.

### Commit
- `b76f37c` - `Build state fellowship directory page`
