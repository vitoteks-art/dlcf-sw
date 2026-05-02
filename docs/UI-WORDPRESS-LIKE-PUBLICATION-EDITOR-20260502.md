# UI Spec — WordPress-like Publication Editor Upgrade

Date: 2026-05-02
Project ID: DLCF-SW-WORDPRESS-LIKE-PUBLICATION-EDITOR
Gate: UI
Status: Awaiting `APPROVE UI DLCF-SW-WORDPRESS-LIKE-PUBLICATION-EDITOR`

## 1. UI Goal

Upgrade **Admin → Publications** from a basic publication form into a WordPress-like content editing experience.

The new publication experience should feel like a proper CMS:

- write long-form content comfortably,
- upload and insert images without copying URLs,
- set a featured image with preview,
- reuse existing uploaded media,
- preview the publication before publishing,
- save drafts safely,
- organize content with categories/tags/SEO fields,
- keep the existing DLCF admin dashboard style.

This is not a full admin redesign. It is a focused upgrade inside the existing Publications area.

---

## 2. Main Screen Layout

### 2.1 Publications Library Header

Top section:

- Title: **Publications Library**
- Subtitle: **Create, edit, review, and publish articles, outlines, manuals, magazines, and study resources.**
- Main actions:
  - `+ New Publication`
  - `Media Library`
  - `Refresh`

### 2.2 Workflow Summary Cards

Keep the current workflow cards but make them clearer:

- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

Each card shows count and filters the list when clicked.

### 2.3 Publication List

List columns:

- Title
- Type/Category
- Author
- Scope/State
- Status
- Visibility
- Last Updated
- Actions

Actions:

- Edit
- Preview
- Duplicate later if needed
- Archive/Restore where allowed

---

## 3. New Publication Editor Layout

When user clicks **New Publication** or **Edit**, open a larger editor workspace instead of a cramped form.

Recommended layout:

```text
------------------------------------------------------
| Top bar: Back | Save Draft | Preview | Publish     |
------------------------------------------------------
| Main Editor Area                       | Sidebar    |
| - Title                                | Status     |
| - Slug                                 | Featured   |
| - Rich content editor                  | Category   |
| - Inline images/media                  | Tags       |
| - Excerpt                              | Scope      |
|                                        | SEO        |
------------------------------------------------------
```

The editor can be a full-page editing view inside admin, not a small modal.

---

## 4. WordPress-like Rich Content Editor

### 4.1 Toolbar

Toolbar should support:

- Paragraph
- Heading 2
- Heading 3
- Bold
- Italic
- Underline
- Bullet list
- Numbered list
- Quote
- Link
- Align left / center / right
- Insert image
- Insert file/link
- Clear formatting
- Undo / redo if editor supports it

### 4.2 Content Area

The writing area should:

- feel spacious,
- support long articles,
- show content formatting while editing,
- support pasted content from Word/Google Docs as cleanly as possible,
- allow images inside the body,
- support captions under images,
- support alt text for accessibility.

### 4.3 Recommended Editor Technology

Replace the current basic `contentEditable + document.execCommand` editor with a proper editor library.

Recommended options:

1. **TipTap** — best long-term option for React, extensible, modern, good for structured content.
2. **TinyMCE** — most WordPress-like feel, familiar toolbar, strong editor UX.
3. **CKEditor 5** — powerful but heavier.

Recommendation: **TipTap**, unless exact WordPress familiarity is more important than customization. If exact WordPress-style toolbar is preferred, use **TinyMCE**.

---

## 5. Featured Image Experience

The current cover image field should be replaced with a polished **Featured Image** panel.

### 5.1 Sidebar Featured Image Card

Show:

- image preview if selected,
- `Set Featured Image` button,
- `Replace Image` button,
- `Remove` button,
- alt text field,
- caption field optional.

### 5.2 Upload Behavior

When selecting a featured image:

- user can drag/drop or click upload,
- progress indicator shows upload state,
- preview appears immediately after upload,
- uploaded image URL is saved automatically in the form,
- errors are shown clearly in plain language.

No manual image URL copying should be required.

---

## 6. Inline Image Upload Inside Content

Inside the rich editor, the user should be able to:

1. click `Insert Image`,
2. choose upload or media library,
3. upload/select image,
4. image appears directly inside the article body,
5. optionally add caption and alt text.

Inline images should support:

- centered display,
- full-width image option,
- caption text,
- remove image,
- replace image,
- alt text.

---

## 7. Media Library Modal

Add a WordPress-like media picker modal.

### 7.1 Modal Tabs

Tabs:

- **Upload Files**
- **Media Library**

### 7.2 Upload Files Tab

Features:

- drag-and-drop area,
- click to choose file,
- upload progress,
- accepted file types clearly displayed,
- successful upload preview,
- clear error messages.

### 7.3 Media Library Tab

Features:

- grid of uploaded media,
- search field,
- filter by type:
  - Images
  - Documents
  - Audio
  - Video
- selected media details panel:
  - preview,
  - filename/title,
  - uploaded date,
  - alt text,
  - caption,
  - copy URL optional,
  - `Use as Featured Image`,
  - `Insert into Content`.

### 7.4 Reuse Existing Media

Users should be able to select an existing image and insert it into content or use as featured image without uploading again.

---

## 8. Sidebar Settings

The editor sidebar should contain organized panels.

### 8.1 Status & Workflow

Fields/buttons:

- current status badge,
- Save Draft,
- Submit for Review,
- Mark Approved,
- Publish Now,
- Schedule,
- Archive,
- Review notes.

Button visibility depends on user authority.

### 8.2 Publication Details

Fields:

- Publication type/category,
- Author,
- Publish date,
- Visibility,
- Featured toggle,
- Pinned until date.

### 8.3 Scope

Fields:

- Scope: Zonal or State,
- State selector.

Behavior:

- Administrator/zonal roles can choose zonal/state according to authority.
- State roles are locked to their assigned state.
- User must not be able to publish outside assigned scope.

### 8.4 Tags

Support comma-separated tags initially.

Later improvement:

- tag suggestions,
- reusable taxonomy.

### 8.5 SEO

Fields:

- SEO title,
- SEO description,
- slug preview,
- public URL preview.

---

## 9. Excerpt / Summary

Add a dedicated **Excerpt / Summary** area.

This should be used for:

- publication cards,
- search results,
- social previews,
- public listing pages.

Can be below editor or in sidebar.

---

## 10. Autosave and Unsaved Changes Protection

### 10.1 Autosave

Add autosave for drafts:

- autosave every 30–60 seconds after changes,
- show status text:
  - `Saving…`
  - `Saved`
  - `Unsaved changes`
  - `Autosave failed`

### 10.2 Leave Warning

If the user tries to leave with unsaved changes:

- show warning prompt,
- allow user to cancel and save.

---

## 11. Preview Mode

Add preview button.

Preview should show how the publication will appear publicly:

- title,
- author,
- date,
- category,
- featured image,
- formatted content,
- inline images,
- captions,
- tags,
- mobile-friendly layout.

Preview can open:

- in a modal, or
- in a new admin preview route.

Recommended: new preview route or full-screen modal for better review.

---

## 12. Upload UX Requirements

All uploads should show:

- accepted file types,
- file size guidance,
- progress bar/spinner,
- success message,
- preview after upload,
- clear error message if upload fails.

Plain-language upload errors:

- “The file is too large. Please upload an image below the allowed size.”
- “Only image files are allowed here.”
- “Upload failed because the connection was interrupted. Please try again.”
- “The server could not save this file. Please contact the administrator.”

---

## 13. Publish Checklist

Before publishing, show a checklist:

- Title present
- Excerpt present
- Category/type present
- Featured image present
- Content body or file present
- Scope/state valid
- SEO title present
- SEO description present

If checklist is incomplete:

- allow Save Draft,
- allow Submit for Review if desired,
- block Publish Now until required items are complete.

---

## 14. Mobile/Responsive Behavior

On smaller screens:

- editor stacks above sidebar,
- toolbar wraps cleanly,
- media library becomes full-screen modal,
- action buttons remain easy to tap.

---

## 15. Implementation Notes for Existing DLCF Admin

Current files likely affected:

- `web/src/components/admin/AdminPublications.jsx`
- `web/src/components/RichTextEditor.jsx`
- shared admin CSS in `web/src/App.css` or related stylesheet
- upload logic in admin shell/API integration
- publication API payload handling if new fields are added
- media/upload endpoints if media library metadata is added

Implementation should be staged:

### Stage 1 — Editor + featured image upgrade

- Replace current rich editor with proper editor component.
- Add large editor layout.
- Add featured image panel with seamless upload.
- Add preview and clearer publish checklist.

### Stage 2 — Media library modal

- Add upload tab.
- Add media library browse/select tab.
- Support selecting media for featured image or inline insertion.

### Stage 3 — Autosave and polish

- Add autosave draft behavior.
- Add unsaved changes warning.
- Improve preview route/modal.
- Improve image captions/alt text.

---

## 16. Acceptance Criteria

The UI is ready when:

- user can create a publication without manually entering image URLs,
- user can upload featured image and see preview immediately,
- user can insert images inside content directly from the editor,
- user can reuse an existing uploaded image from media library,
- user can write formatted content similar to WordPress,
- user can save draft, preview, submit, approve, publish, or schedule according to role,
- user gets clear errors when upload fails,
- state/zonal access rules remain respected,
- public preview reflects formatted content correctly.

---

## 17. Approval Gate

If this UI direction is approved, reply:

`APPROVE UI DLCF-SW-WORDPRESS-LIKE-PUBLICATION-EDITOR`

Implementation will not begin until UI is approved.
