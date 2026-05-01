import { Link } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../api";

export default function StateCongressPage({
  user,
  clusters,
  status,
  submitStateCongress,
  stateCongress,
  setStateCongress,
  setStateCongressRegions,
  setStateCongressCentres,
  loadStateCongressEntry,
  stateCongressEntryId,
  stateCongressRegions,
  stateCongressCentres,
  stateCongressSettings,
  states,
}) {
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupStatus, setLookupStatus] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [loadKey, setLoadKey] = useState({
    registration_month: "",
  });

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildCongressDays = () => {
    const start = stateCongressSettings?.start_date;
    const end = stateCongressSettings?.end_date;
    if (!start || !end) return [];
    const days = [];
    const [startYear, startMonth, startDay] = start.split("-").map(Number);
    const [endYear, endMonth, endDay] = end.split("-").map(Number);
    let cursor = new Date(startYear, startMonth - 1, startDay);
    const last = new Date(endYear, endMonth - 1, endDay);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
      return [];
    }
    let index = 1;
    while (cursor <= last) {
      const value = formatLocalDate(cursor);
      const labelDate = cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      days.push({
        value,
        label: `Day ${index} - ${labelDate}`,
      });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }
    return days;
  };

  const congressDays = buildCongressDays();
  const isScopedAdmin = ["state_cord", "state_admin", "region_cord", "region_admin"].includes(user?.role);
  const lockedState = isScopedAdmin ? (user?.state || "") : "";
  const stateOptions = isScopedAdmin ? (lockedState ? [lockedState] : []) : states;

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
    const nextState = item.state || "";
    const nextRegion = item.region || "";
    const nextCentre = item.fellowship_centre || "";

    setStateCongress((prev) => ({
      ...prev,
      full_name: item.full_name || prev.full_name,
      gender: item.gender || prev.gender,
      email: item.email || prev.email,
      phone: item.phone || prev.phone,
      state: nextState || prev.state,
      region: nextRegion || prev.region,
      fellowship_centre: nextCentre || prev.fellowship_centre,
      category: item.category || prev.category,
      membership_status: item.membership_status || prev.membership_status,
      cluster: item.cluster || prev.cluster,
    }));
    if (nextState) {
      apiFetch(`/meta/regions?state=${encodeURIComponent(nextState)}`)
        .then((data) => setStateCongressRegions(data.items || []))
        .catch(() => setStateCongressRegions([]));
    }
    if (nextState && nextRegion) {
      apiFetch(
        `/meta/fellowships?state=${encodeURIComponent(nextState)}&region=${encodeURIComponent(nextRegion)}`
      )
        .then((data) => setStateCongressCentres(data.items || []))
        .catch(() => setStateCongressCentres([]));
    }
    setLookupStatus("Biodata loaded into the registration form.");
    setLookupResults([]);
  };

  const handleLoadExisting = async () => {
    if (!loadKey.registration_month) {
      setLookupStatus("Select month to load.");
      return;
    }
    if (!stateCongress.email && !stateCongress.phone) {
      setLookupStatus("Provide email or phone to load existing.");
      return;
    }
    try {
      await loadStateCongressEntry({
        registration_month: loadKey.registration_month,
        email: stateCongress.email,
        phone: stateCongress.phone,
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
          <p className="eyebrow">State Congress</p>
          <h2>State Congress Registration</h2>
          <p className="lede">
            Register once per month using your email or phone number.
          </p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <form onSubmit={submitStateCongress} className="form">
        <div className="grid">
          <label>
            Title
            <select
              value={stateCongress.title}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, title: e.target.value })
              }
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
              value={stateCongress.full_name}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, full_name: e.target.value })
              }
              required
            />
          </label>
          <label>
            Gender
            <select
              value={stateCongress.gender}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, gender: e.target.value })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label>
            Email
            <input
              type="email"
              value={stateCongress.email}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, email: e.target.value })
              }
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              value={stateCongress.phone}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, phone: e.target.value })
              }
              required
            />
          </label>
          <label>
            Congress Day
            <select
              value={stateCongress.registration_date}
              onChange={(e) =>
                setStateCongress({
                  ...stateCongress,
                  registration_date: e.target.value,
                })
              }
              required
              disabled={congressDays.length === 0}
            >
              <option value="">
                {congressDays.length
                  ? "Select day"
                  : "Set congress dates first"}
              </option>
              {congressDays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={stateCongress.category}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, category: e.target.value })
              }
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
              value={stateCongress.membership_status}
              onChange={(e) =>
                setStateCongress({
                  ...stateCongress,
                  membership_status: e.target.value,
                })
              }
            >
              <option value="Associate Coordinator">Associate Coordinator</option>
              <option value="Region Coordinator">Region Coordinator</option>
              <option value="State Coordinator">State Coordinator</option>
              <option value="Zonal Coordinator">Zonal Coordinator</option>
              <option value="General Coordinator">General Coordinator</option>
              <option value="Sister Welfare">Sister Welfare</option>
              <option value="Worker">Worker</option>
              <option value="Member">Member</option>
              <option value="Guest">Guest</option>
            </select>
          </label>
          <label>
            State
            <select
              value={stateCongress.state}
              onChange={(e) =>
                setStateCongress({
                  ...stateCongress,
                  state: lockedState || e.target.value,
                  region: "",
                  cluster: "",
                  fellowship_centre: "",
                })
              }
              required
              disabled={!!lockedState}
            >
              <option value="">Select state</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select
              value={stateCongress.region}
              onChange={(e) =>
                setStateCongress({
                  ...stateCongress,
                  region: e.target.value,
                  cluster: "",
                  fellowship_centre: "",
                })
              }
              required
              disabled={!stateCongress.state}
            >
              <option value="">Select region</option>
              {stateCongressRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cluster
            <select
              value={stateCongress.cluster}
              onChange={(e) =>
                setStateCongress({ ...stateCongress, cluster: e.target.value })
              }
              disabled={!stateCongress.region || clusters.length === 0}
            >
              <option value="">
                {stateCongress.region
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
              value={stateCongress.fellowship_centre}
              onChange={(e) =>
                setStateCongress({
                  ...stateCongress,
                  fellowship_centre: e.target.value,
                })
              }
              required
              disabled={!stateCongress.region}
            >
              <option value="">Select centre</option>
              {stateCongressCentres.map((centre) => (
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
                <div key={item.id} className="admin-list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div>{item.full_name}</div>
                    <div className="small-text">{item.phone || item.email}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => applyBiodata(item)}
                  >
                    Use Biodata
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card">
          <h3>Edit Existing Registration</h3>
          <div className="grid">
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
            <button
              type="button"
              className="btn-outline"
              onClick={handleLoadExisting}
            >
              Load Existing
            </button>
            <span className="small-text">
              {stateCongressEntryId ? "Editing loaded registration." : ""}
            </span>
          </div>
        </div>
        <button type="submit">Submit Registration</button>
      </form>
    </section>
  );
}
