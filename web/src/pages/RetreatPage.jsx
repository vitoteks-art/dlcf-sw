import { Link } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../api";

export default function RetreatPage({
  clusters,
  status,
  submitRetreat,
  retreat,
  setRetreat,
  loadRetreatEntry,
  retreatEntryId,
  retreatRegions,
  retreatCentres,
  states,
}) {
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupStatus, setLookupStatus] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [loadKey, setLoadKey] = useState({
    retreat_type: retreat.retreat_type,
    registration_month: "",
  });

  const handleBiodataLookup = async () => {
    if (!lookupQuery.trim()) {
      setLookupStatus("Enter a name, email, or phone.");
      return;
    }
    setLookupStatus("");
    try {
      const params = new URLSearchParams({ search: lookupQuery.trim() });
      const data = await apiFetch(`/biodata/lookup?${params.toString()}`);
      setLookupResults(data.items || []);
      if ((data.items || []).length === 0) {
        setLookupStatus("No biodata matches found.");
      }
    } catch (err) {
      setLookupStatus(err.message);
    }
  };

  const applyBiodata = (item) => {
    setRetreat((prev) => ({
      ...prev,
      full_name: item.full_name || prev.full_name,
      email: item.email || prev.email,
      phone: item.phone || prev.phone,
      state: item.state || prev.state,
      region: item.region || prev.region,
      fellowship_centre: item.fellowship_centre || prev.fellowship_centre,
      category: item.category || prev.category,
      cluster: item.cluster || prev.cluster,
    }));
    setLookupResults([]);
  };

  const handleLoadExisting = async () => {
    if (!loadKey.retreat_type || !loadKey.registration_month) {
      setLookupStatus("Select retreat type and month to load.");
      return;
    }
    if (!retreat.email && !retreat.phone) {
      setLookupStatus("Provide email or phone to load existing.");
      return;
    }
    try {
      await loadRetreatEntry({
        retreat_type: loadKey.retreat_type,
        registration_month: loadKey.registration_month,
        email: retreat.email,
        phone: retreat.phone,
      });
      setLookupStatus("Loaded existing registration.");
    } catch (err) {
      setLookupStatus(err.message);
    }
  };
  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Retreat Registration</p>
          <h2>Easter & December Retreats</h2>
          <p className="lede">
            Register once per month using your email or phone number.
          </p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <form onSubmit={submitRetreat} className="form">
        <div className="grid">
          <label>
            Retreat
            <select
              value={retreat.retreat_type}
              onChange={(e) =>
                setRetreat({ ...retreat, retreat_type: e.target.value })
              }
            >
              <option value="easter">Easter Retreat</option>
              <option value="december">December Retreat</option>
            </select>
          </label>
          <label>
            Title
            <select
              value={retreat.title}
              onChange={(e) => setRetreat({ ...retreat, title: e.target.value })}
            >
              {["Mr.", "Mrs.", "Miss", "Dr.", "Prof.", "Pastor", "Chief"].map(
                (title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                )
              )}
            </select>
          </label>
          <label>
            Full Name
            <input
              type="text"
              value={retreat.full_name}
              onChange={(e) =>
                setRetreat({ ...retreat, full_name: e.target.value })
              }
              required
            />
          </label>
          <label>
            Gender
            <select
              value={retreat.gender}
              onChange={(e) => setRetreat({ ...retreat, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label>
            Email
            <input
              type="email"
              value={retreat.email}
              onChange={(e) => setRetreat({ ...retreat, email: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              value={retreat.phone}
              onChange={(e) => setRetreat({ ...retreat, phone: e.target.value })}
              required
            />
          </label>
          <label>
            Registration Date
            <input
              type="date"
              value={retreat.registration_date}
              onChange={(e) =>
                setRetreat({ ...retreat, registration_date: e.target.value })
              }
              required
            />
          </label>
          <label>
            Category
            <select
              value={retreat.category}
              onChange={(e) => setRetreat({ ...retreat, category: e.target.value })}
            >
              <option value="Student">Student</option>
              <option value="Corper">Corper</option>
              <option value="Staff">Staff</option>
              <option value="Youth">Youth</option>
              <option value="Children">Children</option>
            </select>
          </label>
          <label>
            Membership Status
            <select
              value={retreat.membership_status}
              onChange={(e) =>
                setRetreat({ ...retreat, membership_status: e.target.value })
              }
            >
              <option value="Member">Member</option>
              <option value="Worker">Worker</option>
              <option value="Associate Coord">Associate Coord</option>
              <option value="Guest">Guest</option>
            </select>
          </label>
          <label>
            State
            <select
              value={retreat.state}
              onChange={(e) =>
                setRetreat({
                  ...retreat,
                  state: e.target.value,
                  region: "",
                  cluster: "",
                  fellowship_centre: "",
                })
              }
              required
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select
              value={retreat.region}
              onChange={(e) =>
                setRetreat({
                  ...retreat,
                  region: e.target.value,
                  cluster: "",
                  fellowship_centre: "",
                })
              }
              required
              disabled={!retreat.state}
            >
              <option value="">Select region</option>
              {retreatRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cluster
            <select
              value={retreat.cluster}
              onChange={(e) => setRetreat({ ...retreat, cluster: e.target.value })}
              disabled={!retreat.region || clusters.length === 0}
            >
              <option value="">
                {retreat.region
                  ? clusters.length
                    ? "Select cluster"
                    : "No clusters for this state"
                  : "Select region first"}
              </option>
              {clusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fellowship Centre
            <select
              value={retreat.fellowship_centre}
              onChange={(e) =>
                setRetreat({ ...retreat, fellowship_centre: e.target.value })
              }
              required
              disabled={!retreat.region}
            >
              <option value="">Select centre</option>
              {retreatCentres.map((centre) => (
                <option key={centre} value={centre}>
                  {centre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="card">
          <h3>Lookup Biodata</h3>
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Search by name, email, or phone"
              style={{ minWidth: "280px" }}
            />
            <button type="button" onClick={handleBiodataLookup}>
              Search Biodata
            </button>
          </div>
          {lookupStatus ? <p className="small-text">{lookupStatus}</p> : null}
          {lookupResults.length > 0 ? (
            <div className="admin-list">
              {lookupResults.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="admin-list-item"
                  onClick={() => applyBiodata(item)}
                >
                  <span>{item.full_name}</span>
                  <span className="small-text">{item.phone || item.email}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card">
          <h3>Edit Existing Registration</h3>
          <div className="grid">
            <label>
              Retreat Type
              <select
                value={loadKey.retreat_type}
                onChange={(e) =>
                  setLoadKey({ ...loadKey, retreat_type: e.target.value })
                }
              >
                <option value="easter">Easter Retreat</option>
                <option value="december">December Retreat</option>
              </select>
            </label>
            <label>
              Month
              <input
                type="month"
                value={loadKey.registration_month}
                onChange={(e) =>
                  setLoadKey({ ...loadKey, registration_month: e.target.value })
                }
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={handleLoadExisting}>
              Load Existing
            </button>
            <span className="small-text">
              {retreatEntryId ? "Editing loaded registration." : ""}
            </span>
          </div>
        </div>
        <button type="submit">Submit Registration</button>
      </form>
    </section>
  );
}
