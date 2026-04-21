import { useEffect, useState } from "react";
import RichTextEditor from "../RichTextEditor";

const emptyHome = {
  hero: {
    title: "",
    subtitle: "",
    intro: "",
    ctaPrimary: "",
    ctaSecondary: "",
    backgroundImageUrl: "",
  },
  about: {
    label: "",
    title: "",
    body: "",
    imageUrl: "",
  },
  leadership: {
    label: "",
    title: "",
    body: "",
    members: [
      { name: "", role: "", quote: "", imageUrl: "" },
      { name: "", role: "", quote: "", imageUrl: "" },
      { name: "", role: "", quote: "", imageUrl: "" },
    ],
  },
  worship: {
    label: "",
    title: "",
    body: "",
    primaryLabel: "",
    primaryUrl: "",
    secondaryLabel: "",
    secondaryUrl: "",
    imageUrl: "",
    sideTitle: "",
    sideBody: "",
  },
  updates: {
    label: "",
    title: "",
    body: "",
  },
  eventsSection: {
    label: "",
    title: "",
    body: "",
  },
  gallerySection: {
    label: "",
    title: "",
    body: "",
  },
  publicationsSection: {
    label: "",
    title: "",
    body: "",
    ctaLabel: "",
  },
  events: [{ title: "", date: "", time: "", type: "" }],
  gallery: [{ url: "", caption: "" }],
  contact: {
    label: "",
    title: "",
    body: "",
    imageUrl: "",
    address: "",
    email: "",
    phone: "",
  },
  sections: [{ title: "", content: "" }],
};

const normalizeHome = (input) => ({
  ...emptyHome,
  ...(input || {}),
  hero: { ...emptyHome.hero, ...((input || {}).hero || {}) },
  about: { ...emptyHome.about, ...((input || {}).about || {}) },
  leadership: {
    ...emptyHome.leadership,
    ...((input || {}).leadership || {}),
    members:
      Array.isArray((input || {}).leadership?.members) && (input || {}).leadership.members.length > 0
        ? (input || {}).leadership.members.map((member) => ({
            name: member?.name || "",
            role: member?.role || "",
            quote: member?.quote || "",
            imageUrl: member?.imageUrl || "",
          }))
        : JSON.parse(JSON.stringify(emptyHome.leadership.members)),
  },
  worship: { ...emptyHome.worship, ...((input || {}).worship || {}) },
  updates: { ...emptyHome.updates, ...((input || {}).updates || {}) },
  eventsSection: { ...emptyHome.eventsSection, ...((input || {}).eventsSection || {}) },
  gallerySection: { ...emptyHome.gallerySection, ...((input || {}).gallerySection || {}) },
  publicationsSection: { ...emptyHome.publicationsSection, ...((input || {}).publicationsSection || {}) },
  contact: { ...emptyHome.contact, ...((input || {}).contact || {}) },
  events:
    Array.isArray((input || {}).events) && (input || {}).events.length > 0
      ? (input || {}).events
      : JSON.parse(JSON.stringify(emptyHome.events)),
  gallery:
    Array.isArray((input || {}).gallery) && (input || {}).gallery.length > 0
      ? (input || {}).gallery
      : JSON.parse(JSON.stringify(emptyHome.gallery)),
  sections:
    Array.isArray((input || {}).sections) && (input || {}).sections.length > 0
      ? (input || {}).sections
      : JSON.parse(JSON.stringify(emptyHome.sections)),
});

export default function AdminStateHome({
  user,
  stateOptions,
  adminStateHomeState,
  setAdminStateHomeState,
  adminStateHomeContent,
  setAdminStateHomeContent,
  handleSaveStateHome,
  uploadImage,
  status,
}) {
  const isStateAdmin =
    user && (user.role === "state_cord" || user.role === "state_admin");
  const canSelectState = !isStateAdmin || !user?.state;
  const [draft, setDraft] = useState(normalizeHome(adminStateHomeContent));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(normalizeHome(adminStateHomeContent));
  }, [adminStateHomeContent]);

  const content = draft;

  const commit = (next) => {
    setDraft(next);
  };

  const update = (path, value) => {
    const next = JSON.parse(JSON.stringify(content));
    let ref = next;
    for (let i = 0; i < path.length - 1; i += 1) {
      ref = ref[path[i]];
    }
    ref[path[path.length - 1]] = value;
    commit(next);
  };

  const updateList = (key, idx, field, value) => {
    const next = JSON.parse(JSON.stringify(content));
    next[key][idx][field] = value;
    commit(next);
  };

  const addRow = (key, row) => {
    const next = JSON.parse(JSON.stringify(content));
    next[key].push(row);
    commit(next);
  };

  const removeRow = (key, idx) => {
    const next = JSON.parse(JSON.stringify(content));
    next[key].splice(idx, 1);
    if (next[key].length === 0) {
      next[key].push(JSON.parse(JSON.stringify(emptyHome[key][0])));
    }
    commit(next);
  };

  const onSubmit = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    setIsSaving(true);
    try {
      setAdminStateHomeContent(content);
      await handleSaveStateHome(event || { preventDefault() {} }, content);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>State Home Page</h3>
      </div>

      <div className="panel-content split-panel">
        <div className="form-card card">
          <h4>Page Editor</h4>
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
            <label>
              State
              <select
                value={adminStateHomeState}
                onChange={(e) => setAdminStateHomeState(e.target.value)}
                required
                disabled={!canSelectState}
              >
                <option value="">Select state</option>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>

            <h5>Hero</h5>
            <div className="grid-2">
              <label>Title<input type="text" value={content.hero.title} onChange={(e) => update(["hero", "title"], e.target.value)} /></label>
              <label>Subtitle<input type="text" value={content.hero.subtitle} onChange={(e) => update(["hero", "subtitle"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Intro (Rich Text)</span>
              <RichTextEditor value={content.hero.intro} onChange={(val) => update(["hero", "intro"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Primary CTA<input type="text" value={content.hero.ctaPrimary} onChange={(e) => update(["hero", "ctaPrimary"], e.target.value)} /></label>
              <label>Secondary CTA<input type="text" value={content.hero.ctaSecondary} onChange={(e) => update(["hero", "ctaSecondary"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Hero Background Image URL<input type="text" value={content.hero.backgroundImageUrl} onChange={(e) => update(["hero", "backgroundImageUrl"], e.target.value)} /></label>
              <label>
                Upload Hero Background
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      if (url) update(["hero", "backgroundImageUrl"], url);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              </label>
            </div>

            <h5>About Section</h5>
            <div className="grid-2">
              <label>Section Label<input type="text" value={content.about.label} onChange={(e) => update(["about", "label"], e.target.value)} /></label>
              <label>About Title<input type="text" value={content.about.title} onChange={(e) => update(["about", "title"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>About Image URL<input type="text" value={content.about.imageUrl} onChange={(e) => update(["about", "imageUrl"], e.target.value)} /></label>
              <label>
                Upload About Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      if (url) update(["about", "imageUrl"], url);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              </label>
            </div>
            <div className="rich-field">
              <span>About Body (Rich Text)</span>
              <RichTextEditor value={content.about.body} onChange={(val) => update(["about", "body"], val)} onUploadImage={uploadImage} />
            </div>

            <h5>Leadership Section</h5>
            <div className="grid-2">
              <label>Section Label<input type="text" value={content.leadership.label} onChange={(e) => update(["leadership", "label"], e.target.value)} /></label>
              <label>Section Title<input type="text" value={content.leadership.title} onChange={(e) => update(["leadership", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Section Intro (Rich Text)</span>
              <RichTextEditor value={content.leadership.body} onChange={(val) => update(["leadership", "body"], val)} onUploadImage={uploadImage} />
            </div>
            {content.leadership.members.map((member, idx) => (
              <div key={`leader-${idx}`} className="section-block">
                <div className="grid-2">
                  <label>Name<input type="text" value={member.name} onChange={(e) => update(["leadership", "members", idx, "name"], e.target.value)} /></label>
                  <label>Role<input type="text" value={member.role} onChange={(e) => update(["leadership", "members", idx, "role"], e.target.value)} /></label>
                </div>
                <div className="grid-2">
                  <label>Image URL<input type="text" value={member.imageUrl} onChange={(e) => update(["leadership", "members", idx, "imageUrl"], e.target.value)} /></label>
                  <label>
                    Upload Leader Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          if (url) update(["leadership", "members", idx, "imageUrl"], url);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="rich-field">
                  <span>Quote / Short Bio (Rich Text)</span>
                  <RichTextEditor value={member.quote} onChange={(val) => update(["leadership", "members", idx, "quote"], val)} onUploadImage={uploadImage} />
                </div>
              </div>
            ))}

            <h5>Updates Section</h5>
            <div className="grid-2">
              <label>Section Label<input type="text" value={content.updates.label} onChange={(e) => update(["updates", "label"], e.target.value)} /></label>
              <label>Section Title<input type="text" value={content.updates.title} onChange={(e) => update(["updates", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Section Intro (Rich Text)</span>
              <RichTextEditor value={content.updates.body} onChange={(val) => update(["updates", "body"], val)} onUploadImage={uploadImage} />
            </div>

            <div className="status" style={{ marginBottom: "1rem" }}>
              Publications and Media are managed in their own dedicated admin sections and are no longer meant to be managed from State Home.
            </div>

            <h5>Contact</h5>
            <div className="grid-2">
              <label>Section Label<input type="text" value={content.contact.label} onChange={(e) => update(["contact", "label"], e.target.value)} /></label>
              <label>Contact Section Title<input type="text" value={content.contact.title} onChange={(e) => update(["contact", "title"], e.target.value)} /></label>
            </div>
            <div className="rich-field">
              <span>Section Intro (Rich Text)</span>
              <RichTextEditor value={content.contact.body} onChange={(val) => update(["contact", "body"], val)} onUploadImage={uploadImage} />
            </div>
            <div className="grid-2">
              <label>Contact Image URL<input type="text" value={content.contact.imageUrl} onChange={(e) => update(["contact", "imageUrl"], e.target.value)} /></label>
              <label>
                Upload Contact Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      if (url) update(["contact", "imageUrl"], url);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>Address<input type="text" value={content.contact.address} onChange={(e) => update(["contact", "address"], e.target.value)} /></label>
            </div>
            <div className="grid-2">
              <label>Email<input type="text" value={content.contact.email} onChange={(e) => update(["contact", "email"], e.target.value)} /></label>
              <label>Phone<input type="text" value={content.contact.phone} onChange={(e) => update(["contact", "phone"], e.target.value)} /></label>
            </div>

            <h5>Custom Sections</h5>
            {content.sections.map((section, idx) => (
              <div key={`section-${idx}`} className="section-block">
                <label>Section Title<input type="text" value={section.title} onChange={(e) => updateList("sections", idx, "title", e.target.value)} /></label>
                <div className="rich-field">
                  <span>Section Content (Rich Text)</span>
                  <RichTextEditor value={section.content} onChange={(val) => updateList("sections", idx, "content", val)} onUploadImage={uploadImage} />
                </div>
                <div className="form-actions"><button type="button" onClick={() => removeRow("sections", idx)}>Remove</button></div>
              </div>
            ))}
            <button type="button" className="ghost" onClick={() => addRow("sections", { title: "", content: "" })}>Add Section</button>

            <div className="form-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Home Page"}
              </button>
            </div>
          </form>
        </div>

        <div className="card preview-panel">
          <h4>Live Preview</h4>
          <div className="preview-hero">
            <p className="public-kicker">{content.hero.subtitle}</p>
            <h1>{content.hero.title || "State Title"}</h1>
            <div className="preview-rich" dangerouslySetInnerHTML={{ __html: content.hero.intro || "" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
