import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BiodataListPage({
  user,
  status,
  loadBiodata,
  biodataFilters,
  setBiodataFilters,
  biodataFilterRegions,
  biodataFilterCentres,
  biodataData,
  biodataHistoryById,
  states,
  canManageBiodata,
  onEditBiodata,
  onDeleteBiodata,
  onLoadBiodataHistory,
}) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const historyFieldLabels = {
    student_status: "Student Status",
    nysc_status: "NYSC Status",
    membership_status: "Membership Status",
    category: "Category",
    marital_status: "Marital Status",
    worker_status: "Worker Status",
  };

  useEffect(() => {
    if (!user || !canManageBiodata) {
      navigate("/");
    }
  }, [navigate, user, canManageBiodata]);

  if (!user || !canManageBiodata) {
    return null;
  }

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata</p>
          <h2>Member Directory</h2>
          <p className="lede">Search and review member biodata records.</p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <form onSubmit={loadBiodata} className="form">
        <div className="grid">
          <label>
            State
            <select
              value={biodataFilters.state}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  state: e.target.value,
                  region: "",
                  fellowship_centre: "",
                })
              }
            >
              <option value="">All</option>
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
              value={biodataFilters.region}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  region: e.target.value,
                  fellowship_centre: "",
                })
              }
              disabled={!biodataFilters.state}
            >
              <option value="">All</option>
              {biodataFilterRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fellowship Centre
            <select
              value={biodataFilters.fellowship_centre}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  fellowship_centre: e.target.value,
                })
              }
              disabled={!biodataFilters.region}
            >
              <option value="">All</option>
              {biodataFilterCentres.map((centre) => (
                <option key={centre} value={centre}>
                  {centre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              type="text"
              value={biodataFilters.search}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  search: e.target.value,
                })
              }
            />
          </label>
          <label>
            Student Status
            <select
              value={biodataFilters.student_status || ""}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  student_status: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="active_student">Active Student</option>
              <option value="graduated">Graduated</option>
              <option value="alumni_ready">Alumni Ready</option>
              <option value="alumni">Alumni</option>
              <option value="deferred">Deferred</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </label>
          <label>
            NYSC Status
            <select
              value={biodataFilters.nysc_status || ""}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  nysc_status: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="none">No NYSC</option>
              <option value="serving">Serving</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <button type="submit">Load Biodata</button>
      </form>
      <div className="report">
        {biodataData.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Centre</th>
                <th>State</th>
                <th>Region</th>
                <th>Student Status</th>
                <th>NYSC Status</th>
                <th>Details</th>
                {canManageBiodata ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {biodataData.map((row, idx) => (
                <Fragment key={row.id ?? `${row.email}-${idx}`}>
                  <tr>
                    <td>{row.full_name}</td>
                    <td>{row.phone}</td>
                    <td>{row.email}</td>
                    <td>{row.fellowship_centre}</td>
                    <td>{row.state}</td>
                    <td>{row.region}</td>
                    <td>{row.student_status || "-"}</td>
                    <td>{row.nysc_status || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-sm btn-outline"
                        onClick={() =>
                          {
                            const next = expandedId === row.id ? null : row.id;
                            setExpandedId(next);
                            if (next === row.id && !biodataHistoryById[row.id]) {
                              onLoadBiodataHistory(row.id);
                            }
                          }
                        }
                      >
                        {expandedId === row.id ? "Hide" : "View"}
                      </button>
                    </td>
                    {canManageBiodata ? (
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn-sm btn-outline"
                            onClick={() => onEditBiodata(row.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-danger"
                            onClick={() => onDeleteBiodata(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                  {expandedId === row.id ? (
                    <tr>
                      <td colSpan={canManageBiodata ? 10 : 9}>
                        <div className="details-panel">
                          {row.profile_photo ? (
                            <div className="details-photo">
                              <img src={row.profile_photo} alt={row.full_name} />
                              <div>
                                <span className="detail-label">Name</span>
                                <span className="detail-value">
                                  {row.full_name}
                                </span>
                              </div>
                            </div>
                          ) : null}
                          <div className="details-grid">
                            <div>
                              <span className="detail-label">Gender</span>
                              <span className="detail-value">{row.gender}</span>
                            </div>
                            <div>
                              <span className="detail-label">Age</span>
                              <span className="detail-value">{row.age}</span>
                            </div>
                            <div>
                              <span className="detail-label">School</span>
                              <span className="detail-value">{row.school}</span>
                            </div>
                            <div>
                              <span className="detail-label">Date of Birth</span>
                              <span className="detail-value">{row.date_of_birth || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Marital Status</span>
                              <span className="detail-value">{row.marital_status || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Program Type</span>
                              <span className="detail-value">{row.program_type || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Academic Level</span>
                              <span className="detail-value">{row.academic_level || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Entry Year</span>
                              <span className="detail-value">{row.entry_year || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Expected Graduation</span>
                              <span className="detail-value">{row.expected_graduation_year || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Student Status</span>
                              <span className="detail-value">{row.student_status || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">NYSC Status</span>
                              <span className="detail-value">{row.nysc_status || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">NYSC Batch</span>
                              <span className="detail-value">{row.nysc_batch || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">NYSC State</span>
                              <span className="detail-value">{row.nysc_state || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">New Birth</span>
                              <span className="detail-value">{row.new_birth_status ? "Yes" : "No"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Sanctification</span>
                              <span className="detail-value">{row.sanctification_status ? "Yes" : "No"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Holy Ghost Baptism</span>
                              <span className="detail-value">{row.holy_ghost_baptism_status ? "Yes" : "No"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Spiritual Notes</span>
                              <span className="detail-value">{row.spiritual_notes || "-"}</span>
                            </div>
                            <div>
                              <span className="detail-label">Worker Status</span>
                              <span className="detail-value">{row.worker_status}</span>
                            </div>
                            <div>
                              <span className="detail-label">Membership</span>
                              <span className="detail-value">
                                {row.membership_status}
                              </span>
                            </div>
                            <div>
                              <span className="detail-label">Cluster</span>
                              <span className="detail-value">{row.cluster}</span>
                            </div>
                            <div>
                              <span className="detail-label">Work Units</span>
                              <span className="detail-value">
                                {(row.work_units || []).join(", ")}
                              </span>
                            </div>
                            <div>
                              <span className="detail-label">Address</span>
                              <span className="detail-value">{row.address}</span>
                            </div>
                            <div>
                              <span className="detail-label">Next of Kin</span>
                              <span className="detail-value">
                                {row.next_of_kin_name}
                              </span>
                            </div>
                            <div>
                              <span className="detail-label">Next of Kin Phone</span>
                              <span className="detail-value">
                                {row.next_of_kin_phone}
                              </span>
                            </div>
                            <div>
                              <span className="detail-label">Relationship</span>
                              <span className="detail-value">
                                {row.next_of_kin_relationship}
                              </span>
                            </div>
                          </div>
                          <div className="card" style={{ marginTop: "1rem" }}>
                            <h4>Lifecycle History</h4>
                            {!biodataHistoryById[row.id] ? (
                              <p className="small-text">Loading history...</p>
                            ) : biodataHistoryById[row.id].length === 0 ? (
                              <p className="small-text">No history entries yet.</p>
                            ) : (
                              <div className="report">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Field</th>
                                      <th>Old Value</th>
                                      <th>New Value</th>
                                      <th>Changed At</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {biodataHistoryById[row.id].map((entry, index) => (
                                      <tr key={`${entry.field_name}-${entry.changed_at}-${index}`}>
                                        <td>{historyFieldLabels[entry.field_name] || entry.field_name}</td>
                                        <td>{entry.old_value || "-"}</td>
                                        <td>{entry.new_value || "-"}</td>
                                        <td>{entry.changed_at}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
