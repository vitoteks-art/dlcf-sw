import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STATUS_LABELS = {
  active_student: "Active Student",
  graduated: "Graduated",
  alumni_ready: "Alumni Ready",
  alumni: "Alumni",
  deferred: "Deferred",
  withdrawn: "Withdrawn",
};

const NYSC_LABELS = {
  none: "No NYSC",
  serving: "Serving",
  completed: "Completed",
};

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
        <div className="actions-cell">
          <Link className="ghost" to="/biodata-dashboard/alumni">
            Alumni Dashboard
          </Link>
          <Link className="ghost" to="/">
            Back to Home
          </Link>
        </div>
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
            Category
            <select
              value={biodataFilters.category || ""}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  category: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="corper">Corper</option>
              <option value="youth">Youth</option>
              <option value="children">Children</option>
            </select>
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
            Lifecycle Bucket
            <select
              value={biodataFilters.lifecycle_bucket || ""}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  lifecycle_bucket: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="active_student">Active Student</option>
              <option value="alumni_ready">Alumni Ready</option>
              <option value="alumni">Alumni</option>
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
          <label>
            Expected Graduation Year
            <input
              type="number"
              value={biodataFilters.expected_graduation_year || ""}
              onChange={(e) =>
                setBiodataFilters({
                  ...biodataFilters,
                  expected_graduation_year: e.target.value,
                })
              }
              placeholder="e.g. 2026"
            />
          </label>
        </div>
        <button type="submit">Load Biodata</button>
      </form>
      <div className="report">
        {biodataData.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Centre</th>
                  <th>Student Status</th>
                  <th>Recommended</th>
                  <th>NYSC</th>
                  <th>Expected Grad</th>
                  <th>Details</th>
                  {canManageBiodata ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {biodataData.map((row, idx) => (
                  <Fragment key={row.id ?? `${row.email}-${idx}`}>
                    <tr>
                      <td>
                        <div>
                          <strong>{row.full_name}</strong>
                          <div className="detail-label" style={{ marginTop: 4 }}>
                            {row.state} / {row.region}
                          </div>
                        </div>
                      </td>
                      <td>{row.fellowship_centre}</td>
                      <td>{STATUS_LABELS[row.student_status] || row.student_status || "-"}</td>
                      <td>
                        {STATUS_LABELS[row.recommended_student_status] ||
                          row.recommended_student_status ||
                          "-"}
                      </td>
                      <td>{NYSC_LABELS[row.nysc_status] || row.nysc_status || "-"}</td>
                      <td>{row.expected_graduation_year || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() => {
                            const next = expandedId === row.id ? null : row.id;
                            setExpandedId(next);
                            if (next === row.id && !biodataHistoryById[row.id]) {
                              onLoadBiodataHistory(row.id);
                            }
                          }}
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
                        <td colSpan={canManageBiodata ? 8 : 7}>
                          <div className="details-panel">
                            {row.profile_photo ? (
                              <div className="details-photo">
                                <img src={row.profile_photo} alt={row.full_name} />
                                <div>
                                  <span className="detail-label">Name</span>
                                  <span className="detail-value">{row.full_name}</span>
                                </div>
                              </div>
                            ) : null}
                            <div className="details-grid">
                              <div>
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{row.phone}</span>
                              </div>
                              <div>
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{row.email}</span>
                              </div>
                              <div>
                                <span className="detail-label">School</span>
                                <span className="detail-value">{row.school}</span>
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
                                <span className="detail-label">Expected Graduation</span>
                                <span className="detail-value">{row.expected_graduation_year || "-"}</span>
                              </div>
                              <div>
                                <span className="detail-label">Student Status</span>
                                <span className="detail-value">
                                  {STATUS_LABELS[row.student_status] || row.student_status || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="detail-label">Recommended Status</span>
                                <span className="detail-value">
                                  {STATUS_LABELS[row.recommended_student_status] ||
                                    row.recommended_student_status ||
                                    "-"}
                                </span>
                              </div>
                              <div>
                                <span className="detail-label">Lifecycle Reason</span>
                                <span className="detail-value">{row.lifecycle_reason || "-"}</span>
                              </div>
                              <div>
                                <span className="detail-label">NYSC Status</span>
                                <span className="detail-value">
                                  {NYSC_LABELS[row.nysc_status] || row.nysc_status || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="detail-label">NYSC Batch</span>
                                <span className="detail-value">{row.nysc_batch || "-"}</span>
                              </div>
                              <div>
                                <span className="detail-label">NYSC State</span>
                                <span className="detail-value">{row.nysc_state || "-"}</span>
                              </div>
                            </div>

                            <div className="card" style={{ marginTop: 16 }}>
                              <h4>Status History</h4>
                              {(biodataHistoryById[row.id] || []).length === 0 ? (
                                <p className="lede">No history yet.</p>
                              ) : (
                                <div className="table-container">
                                  <table className="data-table">
                                    <thead>
                                      <tr>
                                        <th>Field</th>
                                        <th>Old</th>
                                        <th>New</th>
                                        <th>Changed At</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(biodataHistoryById[row.id] || []).map((item, index) => (
                                        <tr key={`${row.id}-history-${index}`}>
                                          <td>{historyFieldLabels[item.field_name] || item.field_name}</td>
                                          <td>{item.old_value || "-"}</td>
                                          <td>{item.new_value || "-"}</td>
                                          <td>{item.changed_at || "-"}</td>
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
          </div>
        )}
      </div>
    </section>
  );
}
