import { useEffect, useState } from "react";
import RichTextEditor from "../RichTextEditor";

const emptyMainHome = {
  hero: {
    kicker: "",
    title: "",
    highlight: "",
    body: "",
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
    backgroundImageUrl: "",
    metaPrimary: "",
    metaSecondary: "",
  },
  about: {
    label: "",
    title: "",
    body: "",
    imageUrl: "",
    pills: ["", "", ""],
  },
  mediaSpotlight: {
    label: "",
    title: "",
    body: "",
    ctaPrimaryLabel: "",
    ctaPrimaryUrl: "",
    ctaSecondaryLabel: "",
    ctaSecondaryUrl: "",
  },
  statesHighlight: {
    label: "",
    title: "",
    body: "",
    cards: [{ title: "", body: "", ctaLabel: "", ctaUrl: "" }],
  },
  eventsAnnouncements: {
    label: "",
    title: "",
    body: "",
    items: [{ title: "", meta: "", type: "" }],
  },
  mentor: {
    label: "",
    title: "",
    body: "",
    imageUrl: "",
    quote: "",
  },
  finalCta: {
    label: "",
    title: "",
    body: "",
    primaryLabel: "",
    primaryUrl: "",
    secondaryLabel: "",
    secondaryUrl: "",
    imageUrl: "",
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeMainHome = (input) => ({
  ...clone(emptyMainHome),
  ...(input || {}),
  hero: { ...emptyMainHome.hero, ...((input || {}).hero || {}) },
  about: {
    ...emptyMainHome.about,
    ...((input || {}).about || {}),
    pills:
      Array.isArray((input || {}).about?.pills) && (input || {}).about.pills.length > 0
        ? (input || {}).about.pills.map((item) => item || "")
        : clone(emptyMainHome.about.pills),
  },
  mediaSpotlight: { ...emptyMainHome.mediaSpotlight, ...((input || {}).mediaSpotlight || {}) },
  statesHighlight: {
    ...emptyMainHome.statesHighlight,
    ...((input || {}).statesHighlight || {}),
    cards:
      Array.isArray((input || {}).statesHighlight?.cards) && (input || {}).statesHighlight.cards.length > 0
        ? (input || {}).statesHighlight.cards.map((card) => ({
            title: card?.title || "",
            body: card?.body || "",
            ctaLabel: card?.ctaLabel || "",
            ctaUrl: card?.ctaUrl || "",
          }))
        : clone(emptyMainHome.statesHighlight.cards),
  },
  eventsAnnouncements: {
    ...emptyMainHome.eventsAnnouncements,
    ...((input || {}).eventsAnnouncements || {}),
    items:
      Array.isArray((input || {}).eventsAnnouncements?.items) && (input || {}).eventsAnnouncements.items.length > 0
        ? (input || {}).eventsAnnouncements.items.map((item) => ({
            title: item?.title || "",
            meta: item?.meta || "",
            type: item?.type || "",
          }))
        : clone(emptyMainHome.eventsAnnouncements.items),
  },
  mentor: { ...emptyMainHome.mentor, ...((input || {}).mentor || {}) },
  finalCta: { ...emptyMainHome.finalCta, ...((input || {}).finalCta || {}) },
});

export default function AdminMainHome({ adminMainHomeContent, setAdminMainHomeContent, handleSaveMainHome, uploadImage, status }) {
  const [draft, setDraft] = useState(normalizeMainHome(adminMainHomeContent));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(normalizeMainHome(adminMainHomeContent));
  }, [adminMainHomeContent]);

  const content = draft;

  const commit = (next) => setDraft(next);

  const update = (path, value) => {
    const next = clone(content);
    let ref = next;
    for (let i = 0; i < path.length - 1; i += 1) ref = ref[path[i]];
    ref[path[path.length - 1]] = value;
    commit(next);
  };

  const updateArrayValue = (path, index, value) => {
    const next = clone(content);
    let ref = next;
    for (let i = 0; i < path.length; i += 1) ref = ref[path[i]];
    ref[index] = value;
    commit(next);
  };

  const updateListObject = (key, idx, field, value) => {
    const next = clone(content);
    next[key][idx][field] = value;
    commit(next);
  };

  const addRow = (key, row) => {
    const next = clone(content);
    next[key].push(row);
    commit(next);
  };

  const removeRow = (key, idx, fallbackRow) => {
    const next = clone(content);
    next[key].splice(idx, 1);
    if (next[key].length === 0) next[key].push(clone(fallbackRow));
    commit(next);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      setAdminMainHomeContent(content);
      await handleSaveMainHome(event, content);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadTo = async (path, file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      if (url) update(path, url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Main Home Page</h3>
      </div>

      <div className="panel-content split-panel">
        <div className="form-card card">
          <h4>Homepage CMS Editor</h4>
          {status ? (
            <div
              className="status"
              style={{
                marginBottom: "1rem",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                background: status.toLowerCase().includes("failed") ? "#3b1212" : "#0f2e1f",
                color: "#fff",
                border: status.toLowerCase().includes("failed") ? "1px solid #7f1d1d" : "1px solid #166534",
                fontWeight: 600,
              }}
            >
              {status}
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="form compact-form">
            <h5>Hero</h5>
            <div className="grid-2">
              <label>Kicker<input type="text" value={content.hero.kicker} onChange={(e) => update(["hero", "kicker"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.hero.title} onChange={(e) => update(["hero", "title"], e.target.value)} /></label>
            </div>
            <label>Highlight Text<input type="text" value={content.hero.highlight} onChange={(e) => update(["hero", "highlight"], e.target.value)} /></label>
            <div className="rich-field">
              <span>Hero Body</span>
              <RichTextEditor value={content.hero.body} onChange={(val) => update(["hero", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Primary CTA Label<input type="text" value={content.hero.primaryCtaLabel} onChange={(e) => update(["hero", "primaryCtaLabel"], e.target.value)} /></label>
              <label>Primary CTA URL<input type="text" value={content.hero.primaryCtaUrl} onChange={(e) => update(["hero", "primaryCtaUrl"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Secondary CTA Label<input type="text" value={content.hero.secondaryCtaLabel} onChange={(e) => update(["hero", "secondaryCtaLabel"], e.target.value)} /></label>
              <label>Secondary CTA URL<input type="text" value={content.hero.secondaryCtaUrl} onChange={(e) => update(["hero", "secondaryCtaUrl"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Hero Background Image URL<input type="text" value={content.hero.backgroundImageUrl} onChange={(e) => update(["hero", "backgroundImageUrl"], e.target.value)} /></label>
              <label>
                Upload Hero Background
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; await uploadTo(["hero", "backgroundImageUrl"], file); }} />
              </label>
            </div>
            <div className="grid-2">
              <label>Meta Primary<input type="text" value={content.hero.metaPrimary} onChange={(e) => update(["hero", "metaPrimary"], e.target.value)} /></label>
              <label>Meta Secondary<input type="text" value={content.hero.metaSecondary} onChange={(e) => update(["hero", "metaSecondary"], e.target.value)} /></label>
            </div>

            <h5>About Section</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.about.label} onChange={(e) => update(["about", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.about.title} onChange={(e) => update(["about", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>About Body</span>
              <RichTextEditor value={content.about.body} onChange={(val) => update(["about", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Image URL<input type="text" value={content.about.imageUrl} onChange={(e) => update(["about", "imageUrl"], e.target.value)} /></label>
              <label>
                Upload About Image
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; await uploadTo(["about", "imageUrl"], file); }} />
              </label>
            </div>
            <div className="grid-3">
              {content.about.pills.map((pill, idx) => (
                <label key={`pill-${idx}`}>Pill {idx + 1}<input type="text" value={pill} onChange={(e) => updateArrayValue(["about", "pills"], idx, e.target.value)} /></label>
              ))}
            </div>

            <h5>Media Spotlight</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.mediaSpotlight.label} onChange={(e) => update(["mediaSpotlight", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.mediaSpotlight.title} onChange={(e) => update(["mediaSpotlight", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Body</span>
              <RichTextEditor value={content.mediaSpotlight.body} onChange={(val) => update(["mediaSpotlight", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Primary CTA Label<input type="text" value={content.mediaSpotlight.ctaPrimaryLabel} onChange={(e) => update(["mediaSpotlight", "ctaPrimaryLabel"], e.target.value)} /></label>
              <label>Primary CTA URL<input type="text" value={content.mediaSpotlight.ctaPrimaryUrl} onChange={(e) => update(["mediaSpotlight", "ctaPrimaryUrl"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Secondary CTA Label<input type="text" value={content.mediaSpotlight.ctaSecondaryLabel} onChange={(e) => update(["mediaSpotlight", "ctaSecondaryLabel"], e.target.value)} /></label>
              <label>Secondary CTA URL<input type="text" value={content.mediaSpotlight.ctaSecondaryUrl} onChange={(e) => update(["mediaSpotlight", "ctaSecondaryUrl"], e.target.value)} /></label>
            </div>

            <h5>Featured States / Highlight Cards</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.statesHighlight.label} onChange={(e) => update(["statesHighlight", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.statesHighlight.title} onChange={(e) => update(["statesHighlight", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Body</span>
              <RichTextEditor value={content.statesHighlight.body} onChange={(val) => update(["statesHighlight", "body"], val)} onUploadImage={uploadImage} />
            </div>
            {content.statesHighlight.cards.map((card, idx) => (
              <div key={`state-card-${idx}`} className="repeat-card">
                <div className="repeat-card__head">
                  <strong>Highlight Card {idx + 1}</strong>
                  <button type="button" className="btn-text" onClick={() => removeRow("statesHighlight", idx, emptyMainHome.statesHighlight.cards[0])}>Remove</button>
                </div>
                <div className="grid-2">
                  <label>Title<input type="text" value={card.title} onChange={(e) => updateListObject("statesHighlight", idx, "title", e.target.value)} /></label>
                  <label>CTA Label<input type="text" value={card.ctaLabel} onChange={(e) => updateListObject("statesHighlight", idx, "ctaLabel", e.target.value)} /></label>
                </div>
                <label>CTA URL<input type="text" value={card.ctaUrl} onChange={(e) => updateListObject("statesHighlight", idx, "ctaUrl", e.target.value)} /></label>
                <div className="rich-field">
                  <span>Body</span>
                  <RichTextEditor value={card.body} onChange={(val) => updateListObject("statesHighlight", idx, "body", val)} onUploadImage={uploadImage} />
                </div>
              </div>
            ))}
            <button type="button" className="btn-primary-outline" onClick={() => addRow("statesHighlight", clone(emptyMainHome.statesHighlight.cards[0]))}>Add Highlight Card</button>

            <h5>Events / Announcements</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.eventsAnnouncements.label} onChange={(e) => update(["eventsAnnouncements", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.eventsAnnouncements.title} onChange={(e) => update(["eventsAnnouncements", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Body</span>
              <RichTextEditor value={content.eventsAnnouncements.body} onChange={(val) => update(["eventsAnnouncements", "body"], val)} onUploadImage={uploadImage} />
            </div>
            {content.eventsAnnouncements.items.map((item, idx) => (
              <div key={`announcement-${idx}`} className="repeat-card">
                <div className="repeat-card__head">
                  <strong>Card {idx + 1}</strong>
                  <button type="button" className="btn-text" onClick={() => removeRow("eventsAnnouncements", idx, emptyMainHome.eventsAnnouncements.items[0])}>Remove</button>
                </div>
                <div className="grid-3">
                  <label>Title<input type="text" value={item.title} onChange={(e) => updateListObject("eventsAnnouncements", idx, "title", e.target.value)} /></label>
                  <label>Meta<input type="text" value={item.meta} onChange={(e) => updateListObject("eventsAnnouncements", idx, "meta", e.target.value)} /></label>
                  <label>Type<input type="text" value={item.type} onChange={(e) => updateListObject("eventsAnnouncements", idx, "type", e.target.value)} /></label>
                </div>
              </div>
            ))}
            <button type="button" className="btn-primary-outline" onClick={() => addRow("eventsAnnouncements", clone(emptyMainHome.eventsAnnouncements.items[0]))}>Add Event/Announcement Card</button>

            <h5>Mentor Spotlight</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.mentor.label} onChange={(e) => update(["mentor", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.mentor.title} onChange={(e) => update(["mentor", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Body</span>
              <RichTextEditor value={content.mentor.body} onChange={(val) => update(["mentor", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <label>Quote<input type="text" value={content.mentor.quote} onChange={(e) => update(["mentor", "quote"], e.target.value)} /></label>
            <div className="grid-2">
              <label>Image URL<input type="text" value={content.mentor.imageUrl} onChange={(e) => update(["mentor", "imageUrl"], e.target.value)} /></label>
              <label>
                Upload Mentor Image
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; await uploadTo(["mentor", "imageUrl"], file); }} />
              </label>
            </div>

            <h5>Final CTA</h5>
            <div className="grid-2">
              <label>Label<input type="text" value={content.finalCta.label} onChange={(e) => update(["finalCta", "label"], e.target.value)} /></label>
              <label>Title<input type="text" value={content.finalCta.title} onChange={(e) => update(["finalCta", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Body</span>
              <RichTextEditor value={content.finalCta.body} onChange={(val) => update(["finalCta", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Primary CTA Label<input type="text" value={content.finalCta.primaryLabel} onChange={(e) => update(["finalCta", "primaryLabel"], e.target.value)} /></label>
              <label>Primary CTA URL<input type="text" value={content.finalCta.primaryUrl} onChange={(e) => update(["finalCta", "primaryUrl"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Secondary CTA Label<input type="text" value={content.finalCta.secondaryLabel} onChange={(e) => update(["finalCta", "secondaryLabel"], e.target.value)} /></label>
              <label>Secondary CTA URL<input type="text" value={content.finalCta.secondaryUrl} onChange={(e) => update(["finalCta", "secondaryUrl"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Image URL<input type="text" value={content.finalCta.imageUrl} onChange={(e) => update(["finalCta", "imageUrl"], e.target.value)} /></label>
              <label>
                Upload CTA Image
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; await uploadTo(["finalCta", "imageUrl"], file); }} />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save Homepage"}</button>
            </div>
          </form>
        </div>

        <div className="form-card card preview-panel">
          <h4>CMS Summary</h4>
          <div className="compact-list">
            <div className="compact-list-item"><strong>Hero:</strong><span>{content.hero.title || "Not set"}</span></div>
            <div className="compact-list-item"><strong>About:</strong><span>{content.about.title || "Not set"}</span></div>
            <div className="compact-list-item"><strong>Media spotlight:</strong><span>{content.mediaSpotlight.title || "Not set"}</span></div>
            <div className="compact-list-item"><strong>States:</strong><span>{content.statesHighlight.cards.length} card(s)</span></div>
            <div className="compact-list-item"><strong>Announcements:</strong><span>{content.eventsAnnouncements.items.length} item(s)</span></div>
            <div className="compact-list-item"><strong>Mentor:</strong><span>{content.mentor.title || "Not set"}</span></div>
            <div className="compact-list-item"><strong>Final CTA:</strong><span>{content.finalCta.title || "Not set"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
