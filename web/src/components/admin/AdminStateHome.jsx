import { useEffect } from "react";
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
  stats: {
    members: "",
    regions: "",
    centers: "",
    growth: "",
  },
  events: [{ title: "", date: "", time: "", type: "" }],
  gallery: [{ url: "", caption: "" }],
  contact: {
    address: "",
    email: "",
    phone: "",
  },
  sections: [{ title: "", content: "" }],
};

export default function AdminStateHome({
  user,
  stateOptions,
  adminStateHomeState,
  setAdminStateHomeState,
  adminStateHomeContent,
  setAdminStateHomeContent,
  loadAdminStateHome,
  handleSaveStateHome,
  uploadImage,
}) {
  const isStateAdmin =
    user && (user.role === "state_cord" || user.role === "state_admin");
  const canSelectState = !isStateAdmin || !user?.state;

  useEffect(() => {
    if (!adminStateHomeState) return;
    loadAdminStateHome(adminStateHomeState);
  }, [adminStateHomeState, loadAdminStateHome]);

  const content = adminStateHomeContent || emptyHome;

  const update = (path, value) => {
    setAdminStateHomeContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev || emptyHome));
      let ref = next;
      for (let i = 0; i < path.length - 1; i += 1) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateList = (key, idx, field, value) => {
    setAdminStateHomeContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev || emptyHome));
      next[key][idx][field] = value;
      return next;
    });
  };

  const addRow = (key, row) => {
    setAdminStateHomeContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev || emptyHome));
      next[key].push(row);
      return next;
    });
  };

  const removeRow = (key, idx) => {
    setAdminStateHomeContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev || emptyHome));
      next[key].splice(idx, 1);
      if (next[key].length === 0) {
        next[key].push(JSON.parse(JSON.stringify(emptyHome[key][0])));
      }
      return next;
    });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>State Home Page</h3>
      </div>

      <div className="panel-content split-panel">
        <div className="form-card card">
          <h4>Page Editor</h4>
          <form onSubmit={handleSaveStateHome} className="form compact-form">
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
              <label>
                Title
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => update(["hero", "title"], e.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  type="text"
                  value={content.hero.subtitle}
                  onChange={(e) => update(["hero", "subtitle"], e.target.value)}
                />
              </label>
            </div>
            <div className="rich-field">
              <span>Intro (Rich Text)</span>
              <RichTextEditor
                value={content.hero.intro}
                onChange={(val) => update(["hero", "intro"], val)}
                onUploadImage={uploadImage}
              />
            </div>
            <div className="grid-2">
              <label>
                Primary CTA
                <input
                  type="text"
                  value={content.hero.ctaPrimary}
                  onChange={(e) => update(["hero", "ctaPrimary"], e.target.value)}
                />
              </label>
              <label>
                Secondary CTA
                <input
                  type="text"
                  value={content.hero.ctaSecondary}
                  onChange={(e) =>
                    update(["hero", "ctaSecondary"], e.target.value)
                  }
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Hero Background Image URL
                <input
                  type="text"
                  value={content.hero.backgroundImageUrl}
                  onChange={(e) =>
                    update(["hero", "backgroundImageUrl"], e.target.value)
                  }
                />
              </label>
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
                      if (url) {
                        update(["hero", "backgroundImageUrl"], url);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              </label>
            </div>
            {content.hero.backgroundImageUrl ? (
              <div className="upload-preview">
                <img
                  src={content.hero.backgroundImageUrl}
                  alt="Hero background"
                />
              </div>
            ) : null}

            <h5>Stats</h5>
            <div className="grid-2">
              <label>
                Members
                <input
                  type="text"
                  value={content.stats.members}
                  onChange={(e) => update(["stats", "members"], e.target.value)}
                />
              </label>
              <label>
                Regions
                <input
                  type="text"
                  value={content.stats.regions}
                  onChange={(e) => update(["stats", "regions"], e.target.value)}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Centers
                <input
                  type="text"
                  value={content.stats.centers}
                  onChange={(e) => update(["stats", "centers"], e.target.value)}
                />
              </label>
              <label>
                Growth
                <input
                  type="text"
                  value={content.stats.growth}
                  onChange={(e) => update(["stats", "growth"], e.target.value)}
                />
              </label>
            </div>

            <h5>Events</h5>
            {content.events.map((event, idx) => (
              <div key={`event-${idx}`} className="grid-4">
                <label>
                  Title
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) =>
                      updateList("events", idx, "title", e.target.value)
                    }
                  />
                </label>
                <label>
                  Date
                  <input
                    type="text"
                    value={event.date}
                    onChange={(e) =>
                      updateList("events", idx, "date", e.target.value)
                    }
                  />
                </label>
                <label>
                  Time
                  <input
                    type="text"
                    value={event.time}
                    onChange={(e) =>
                      updateList("events", idx, "time", e.target.value)
                    }
                  />
                </label>
                <label>
                  Type
                  <input
                    type="text"
                    value={event.type}
                    onChange={(e) =>
                      updateList("events", idx, "type", e.target.value)
                    }
                  />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => removeRow("events", idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="ghost"
              onClick={() =>
                addRow("events", { title: "", date: "", time: "", type: "" })
              }
            >
              Add Event
            </button>

            <h5>Gallery</h5>
            {content.gallery.map((photo, idx) => (
              <div key={`gallery-${idx}`} className="grid-2">
                <label>
                  Image URL
                  <input
                    type="text"
                    value={photo.url}
                    onChange={(e) =>
                      updateList("gallery", idx, "url", e.target.value)
                    }
                  />
                </label>
                <label>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      try {
                        const url = await uploadImage(file);
                        if (url) {
                          updateList("gallery", idx, "url", url);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  />
                </label>
                {photo.url ? (
                  <div className="upload-preview">
                    <img src={photo.url} alt={photo.caption || "Gallery image"} />
                  </div>
                ) : null}
                <label>
                  Caption
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) =>
                      updateList("gallery", idx, "caption", e.target.value)
                    }
                  />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => removeRow("gallery", idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="ghost"
              onClick={() => addRow("gallery", { url: "", caption: "" })}
            >
              Add Photo
            </button>

            <h5>Contact</h5>
            <div className="grid-2">
              <label>
                Address
                <input
                  type="text"
                  value={content.contact.address}
                  onChange={(e) => update(["contact", "address"], e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="text"
                  value={content.contact.email}
                  onChange={(e) => update(["contact", "email"], e.target.value)}
                />
              </label>
            </div>
            <label>
              Phone
              <input
                type="text"
                value={content.contact.phone}
                onChange={(e) => update(["contact", "phone"], e.target.value)}
              />
            </label>

            <h5>Custom Sections</h5>
            {content.sections.map((section, idx) => (
              <div key={`section-${idx}`} className="section-block">
                <label>
                  Section Title
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateList("sections", idx, "title", e.target.value)
                    }
                  />
                </label>
                <div className="rich-field">
                  <span>Section Content (Rich Text)</span>
                  <RichTextEditor
                    value={section.content}
                    onChange={(val) =>
                      updateList("sections", idx, "content", val)
                    }
                    onUploadImage={uploadImage}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => removeRow("sections", idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="ghost"
              onClick={() => addRow("sections", { title: "", content: "" })}
            >
              Add Section
            </button>

            <div className="form-actions">
              <button type="submit">Save Home Page</button>
            </div>
          </form>
        </div>

        <div className="card preview-panel">
          <h4>Live Preview</h4>
          <div className="preview-hero">
            <p className="public-kicker">{content.hero.subtitle}</p>
            <h1>{content.hero.title || "State Title"}</h1>
            <div
              className="preview-rich"
              dangerouslySetInnerHTML={{ __html: content.hero.intro || "" }}
            />
            <div className="public-cta-row">
              {content.hero.ctaPrimary ? (
                <button type="button" className="public-btn primary">
                  {content.hero.ctaPrimary}
                </button>
              ) : null}
              {content.hero.ctaSecondary ? (
                <button type="button" className="public-btn ghost">
                  {content.hero.ctaSecondary}
                </button>
              ) : null}
            </div>
          </div>

          <section className="public-section">
            <h2>State Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{content.stats.members || "—"}</h3>
                <p>Total Members</p>
              </div>
              <div className="stat-card">
                <h3>{content.stats.regions || "—"}</h3>
                <p>Regions / LGAs</p>
              </div>
              <div className="stat-card">
                <h3>{content.stats.centers || "—"}</h3>
                <p>Fellowship Centers</p>
              </div>
              <div className="stat-card">
                <h3>{content.stats.growth || "—"}</h3>
                <p>Annual Growth</p>
              </div>
            </div>
          </section>

          <section className="public-section">
            <h2>Upcoming Events</h2>
            <div className="events-grid">
              {content.events.map((event, idx) => (
                <div key={`preview-event-${idx}`} className="event-card">
                  <div className="event-date">{event.date || "Date"}</div>
                  <h4>{event.title || "Event"}</h4>
                  <p className="time">{event.time || "Time"}</p>
                  {event.type ? <span className="pill">{event.type}</span> : null}
                </div>
              ))}
            </div>
          </section>

          <section className="public-section">
            <h2>Photo Gallery</h2>
            <div className="arms-grid">
              {content.gallery.map((photo, idx) => (
                <div key={`preview-photo-${idx}`} className="gallery-item">
                  <div
                    className="image-frame"
                    style={{
                      minHeight: "200px",
                      backgroundImage: photo.url ? `url(${photo.url})` : "none",
                      backgroundSize: "cover",
                    }}
                  />
                  <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                    {photo.caption || "Caption"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {content.sections.map((section, idx) => (
            <section key={`preview-section-${idx}`} className="public-section">
              <h2>{section.title || "Section Title"}</h2>
              <div
                className="preview-rich"
                dangerouslySetInnerHTML={{ __html: section.content || "" }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
