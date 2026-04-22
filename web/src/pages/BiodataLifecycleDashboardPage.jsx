import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const STATUS_LABELS = {
  staff: "Staff",
  student: "Students",
  corper: "Corpers",
  youth: "Youth",
  children: "Children",
  unspecified: "Unspecified",
  active_student: "Active Students",
  graduated: "Graduated",
  alumni_ready: "Alumni Ready",
  alumni: "Alumni",
  deferred: "Deferred",
  withdrawn: "Withdrawn",
  nysc_serving: "NYSC Serving",
  nysc_completed: "NYSC Completed",
};

export default function BiodataLifecycleDashboardPage({
  user,
  canManageBiodata,
  status,
  dashboard,
  loadDashboard,
  onRunAction,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canManageBiodata) {
      navigate("/");
      return;
    }
    loadDashboard();
  }, [user, canManageBiodata]);

  if (!user || !canManageBiodata) return null;

  const counts = dashboard?.counts || {};
  const candidates = dashboard?.candidates || [];
  const recentTransitions = dashboard?.recent_transitions || [];
  const categorySummary = dashboard?.category_summary || [];

  return (
    <section className="card retreat-page lifecycle-dashboard-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Dashboard</p>
          <h2>Alumni Lifecycle Dashboard</h2>
          <p className="lede">
            Track who is active, who is due for transition, and who should move into alumni status.
          </p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <div className="lifecycle-card-grid">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div className="lifecycle-stat-card" key={key}>
            <span className="detail-label">{label}</span>
            <strong>{counts[key] || 0}</strong>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4>Category Summary</h4>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((row) => (
                <tr key={`category-${row.label}`}>
                  <td>{STATUS_LABELS[row.label] || row.label}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4>Transition Candidates</h4>
        {candidates.length === 0 ? (
          <p className="lede">No transition candidates right now.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Current</th>
                  <th>Recommended</th>
                  <th>NYSC</th>
                  <th>Expected Grad</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((row) => (
                  <tr key={row.id}>
                    <td>{row.full_name}</td>
                    <td>{STATUS_LABELS[row.category] || row.category || "-"}</td>
                    <td>{row.student_status}</td>
                    <td>{row.recommended_student_status}</td>
                    <td>{row.nysc_status || "-"}</td>
                    <td>{row.expected_graduation_year || "-"}</td>
                    <td>{row.reason}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() => onRunAction({ id: row.id, action: "auto" })}
                        >
                          Apply Auto
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            onRunAction({
                              id: row.id,
                              action: "override",
                              student_status: "alumni",
                            })
                          }
                        >
                          Mark Alumni
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4>Auto-Transition to Alumni</h4>
        {recentTransitions.length === 0 ? (
          <p className="lede">No immediate NYSC-complete alumni transitions detected.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Current</th>
                  <th>Recommended</th>
                  <th>NYSC</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentTransitions.map((row) => (
                  <tr key={`recent-${row.id}`}>
                    <td>{row.full_name}</td>
                    <td>{STATUS_LABELS[row.category] || row.category || "-"}</td>
                    <td>{row.student_status}</td>
                    <td>{row.recommended_student_status}</td>
                    <td>{row.nysc_status || "-"}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
