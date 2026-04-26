import { createFollowupContact } from "./followupContactUtils";

export default function FollowupContactRepeater({
  contacts = [],
  onChange,
  visitors = 0,
  converts = 0,
  title = "Visitor / Convert Follow-up Details",
  helper = "Add individual names and contacts for people who should receive follow-up by email or WhatsApp.",
  showCountWarning = true,
}) {
  const updateContact = (index, field, value) => {
    onChange(contacts.map((contact, idx) => (idx === index ? { ...contact, [field]: value } : contact)));
  };
  const addContact = (decisionType) => onChange([...contacts, createFollowupContact(decisionType)]);
  const removeContact = (index) => onChange(contacts.filter((_, idx) => idx !== index));
  const clear = () => onChange([]);

  const visitorRows = contacts.filter((contact) => ["visitor", "first_timer"].includes(contact.decision_type)).length;
  const convertRows = contacts.filter((contact) => ["convert", "recommitment"].includes(contact.decision_type)).length;
  const countMismatch = showCountWarning && ((Number(visitors) || 0) !== visitorRows || (Number(converts) || 0) !== convertRows) && contacts.length > 0;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p className="lede">{helper}</p>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={() => addContact("visitor")}>Add Visitor</button>
          <button type="button" className="btn-outline" onClick={() => addContact("convert")}>Add Convert</button>
          {contacts.length ? <button type="button" className="btn-outline" onClick={clear}>Clear Details</button> : null}
        </div>
      </div>

      {countMismatch ? (
        <div className="status" style={{ marginBottom: 12 }}>
          The summary count and individual details do not match. You can still save, but please confirm the numbers.
        </div>
      ) : null}

      {contacts.length === 0 ? (
        <p className="small-text">No individual follow-up details added yet. Use Add Visitor or Add Convert if you have names/contact details.</p>
      ) : (
        <div className="gck-sessions">
          {contacts.map((contact, index) => (
            <div className="gck-session-card" key={`followup-contact-${index}`}>
              <div className="card-header">
                <h4>Contact {index + 1}</h4>
                <button type="button" className="btn-outline" onClick={() => removeContact(index)}>Remove</button>
              </div>
              <div className="grid">
                <label>
                  Full name
                  <input value={contact.full_name || ""} onChange={(e) => updateContact(index, "full_name", e.target.value)} required={contacts.length > 0} />
                </label>
                <label>
                  Phone / WhatsApp
                  <input value={contact.phone || ""} onChange={(e) => updateContact(index, "phone", e.target.value)} placeholder="080..." />
                </label>
                <label>
                  Email
                  <input type="email" value={contact.email || ""} onChange={(e) => updateContact(index, "email", e.target.value)} />
                </label>
                <label>
                  Gender
                  <select value={contact.gender || ""} onChange={(e) => updateContact(index, "gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
                <label>
                  Decision type
                  <select value={contact.decision_type || "visitor"} onChange={(e) => updateContact(index, "decision_type", e.target.value)}>
                    <option value="visitor">Visitor</option>
                    <option value="convert">Convert</option>
                    <option value="first_timer">First timer</option>
                    <option value="recommitment">Recommitment</option>
                  </select>
                </label>
                <label>
                  Category
                  <select value={contact.category || ""} onChange={(e) => updateContact(index, "category", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Student">Student</option>
                    <option value="Worker">Worker</option>
                    <option value="Alumni">Alumni</option>
                    <option value="NYSC">NYSC</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
              <div className="grid">
                <label>
                  Address / Hostel / Location
                  <input value={contact.address || ""} onChange={(e) => updateContact(index, "address", e.target.value)} />
                </label>
                <label>
                  Notes
                  <input value={contact.notes || ""} onChange={(e) => updateContact(index, "notes", e.target.value)} />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                  <input type="checkbox" checked={contact.consent_to_contact !== false} onChange={(e) => updateContact(index, "consent_to_contact", e.target.checked)} />
                  Consent to contact
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
