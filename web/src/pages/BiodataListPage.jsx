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
  states,
  canManageBiodata,
  onEditBiodata,
  onDeleteBiodata,
}) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  if (!user) {
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
                <th>Category</th>
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
                    <td>{row.category}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-sm btn-outline"
                        onClick={() =>
                          setExpandedId(expandedId === row.id ? null : row.id)
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
                      <td colSpan={canManageBiodata ? 9 : 8}>
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
