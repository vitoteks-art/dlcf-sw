import { useMemo, useState } from "react";
import { apiFetch } from "../api";

const categories = ["Student", "Corper", "Staff", "Children", "Youth"];
const membershipStatuses = ["Member", "Worker", "Associate Coord", "Guest"];

export default function ZonalCongressPage({
  status,
  zonalRegistration,
  setZonalRegistration,
  zonalRegions,
  zonalCentres,
  zonalClusters,
  zonalInstitutions,
  zonalSettings,
  submitZonalRegistration,
  states,
  loadZonalEntry,
  zonalEntryId,
}) {
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupStatus, setLookupStatus] = useState("");
  const [lookupResults, setLookupResults] = useState([]);

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
    setZonalRegistration((prev) => ({
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
    if (!zonalRegistration.email && !zonalRegistration.phone) {
      setLookupStatus("Provide email or phone to load existing.");
      return;
    }
    try {
      await loadZonalEntry({
        email: zonalRegistration.email,
        phone: zonalRegistration.phone,
      });
      setLookupStatus("Loaded existing registration.");
    } catch (err) {
      setLookupStatus(err.message);
    }
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const congressDays = useMemo(() => {
    const start = zonalSettings?.start_date;
    const end = zonalSettings?.end_date;
    if (!start || !end) return [];
    const [startYear, startMonth, startDay] = start.split("-").map(Number);
    const [endYear, endMonth, endDay] = end.split("-").map(Number);
    let cursor = new Date(startYear, startMonth - 1, startDay);
    const last = new Date(endYear, endMonth - 1, endDay);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
      return [];
    }
    const list = [];
    let index = 1;
    while (cursor <= last) {
      const value = formatLocalDate(cursor);
      const labelDate = cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      list.push({ value, label: `Day ${index} - ${labelDate}` });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }
    return list;
  }, [zonalSettings?.start_date, zonalSettings?.end_date]);

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Zonal Congress</p>
          <h2>Congress Registration</h2>
          <p className="lede">Register attendees with biodata lookup support.</p>
        </div>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Lookup Biodata</h3>
            <p className="lede">Search by name, email, or phone.</p>
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent: "flex-start" }}>
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="Search biodata"
            style={{ minWidth: "280px" }}
          />
          <button type="button" onClick={handleBiodataLookup}>
            Search
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
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Registration Form</h3>
            <p className="lede">Complete the registration details.</p>
          </div>
        </div>
        <form onSubmit={submitZonalRegistration} className="form">
          <div className="grid">
            <label>
              Title
              <select
                value={zonalRegistration.title}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    title: e.target.value,
                  })
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
                value={zonalRegistration.full_name}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    full_name: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Gender
              <select
                value={zonalRegistration.gender}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    gender: e.target.value,
                  })
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
                value={zonalRegistration.email}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    email: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Phone
              <input
                type="text"
                value={zonalRegistration.phone}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    phone: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Congress Day
              <select
                value={zonalRegistration.registration_date}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    registration_date: e.target.value,
                  })
                }
                required
                disabled={congressDays.length === 0}
              >
                <option value="">
                  {congressDays.length ? "Select day" : "Set congress dates first"}
                </option>
                {congressDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              State
              <select
                value={zonalRegistration.state}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    state: e.target.value,
                    region: "",
                    cluster: "",
                    institution: "",
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
              Institution
              <select
                value={zonalRegistration.institution}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    institution: e.target.value,
                  })
                }
                required
                disabled={!zonalRegistration.state}
              >
                <option value="">Select institution</option>
                {zonalInstitutions.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Region
              <select
                value={zonalRegistration.region}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    region: e.target.value,
                    cluster: "",
                    fellowship_centre: "",
                  })
                }
                required
                disabled={!zonalRegistration.state}
              >
                <option value="">Select region</option>
                {zonalRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cluster
              <select
                value={zonalRegistration.cluster}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    cluster: e.target.value,
                  })
                }
                disabled={!zonalRegistration.region || zonalClusters.length === 0}
              >
                <option value="">
                  {zonalRegistration.region
                    ? zonalClusters.length
                      ? "Select cluster"
                      : "No clusters for this state"
                    : "Select region first"}
                </option>
                {zonalClusters.map((cluster) => (
                  <option key={cluster} value={cluster}>
                    {cluster}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fellowship Centre
              <select
                value={zonalRegistration.fellowship_centre}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    fellowship_centre: e.target.value,
                  })
                }
                required
                disabled={!zonalRegistration.region}
              >
                <option value="">Select centre</option>
                {zonalCentres.map((centre) => (
                  <option key={centre} value={centre}>
                    {centre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select
                value={zonalRegistration.category}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    category: e.target.value,
                  })
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Membership Status
              <select
                value={zonalRegistration.membership_status}
                onChange={(e) =>
                  setZonalRegistration({
                    ...zonalRegistration,
                    membership_status: e.target.value,
                  })
                }
                required
              >
                {membershipStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit">Submit Registration</button>
        </form>
        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={handleLoadExisting}>
            Load Existing
          </button>
          <span className="small-text">
            {zonalEntryId ? "Editing loaded registration." : ""}
          </span>
        </div>
      </section>
    </section>
  );
}
