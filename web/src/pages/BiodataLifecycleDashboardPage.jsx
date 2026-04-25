import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const STATUS_LABELS = {
  staff: "Staff",
  student: "Students",
  corper: "Corpers",
  youth: "Youth",
  children: "Children",
  unspecified: "Unspecified",
  active_student: "Active Student",
  graduated: "Graduated",
  alumni_ready: "Alumni Ready (legacy)",
  alumni: "Alumni",
  deferred: "Deferred",
  withdrawn: "Withdrawn",
  nysc_serving: "NYSC Serving",
  nysc_completed: "NYSC Completed",
};

function label(value) {
  return STATUS_LABELS[value] || value || "-";
}

function LifecycleTable({ title, emptyText, rows, showActions, onRunAction }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h4>{title}</h4>
      {rows.length === 0 ? (
        <p className="lede">{emptyText}</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Current</th>
                <th>Next</th>
                <th>Expected Grad</th>
                <th>NYSC</th>
                <th>Reason</th>
                {showActions ? <th>Corrections</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.id}`}>
                  <td>{row.full_name}</td>
                  <td>{label(row.student_status)}</td>
                  <td>{label(row.recommended_student_status)}</td>
                  <td>{row.expected_graduation_year || "-"}</td>
                  <td>{label(row.nysc_status)}</td>
                  <td>{row.reason}</td>
                  {showActions ? (
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            onRunAction({
                              id: row.id,
                              action: "override",
                              student_status: "deferred",
                              reason: "Admin marked as deferred",
                            })
                          }
                        >
                          Mark Deferred
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            onRunAction({
                              id: row.id,
                              action: "override",
                              student_status: "withdrawn",
                              reason: "Admin marked as withdrawn",
                            })
                          }
                        >
                          Mark Withdrawn
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            onRunAction({
                              id: row.id,
                              action: "override",
                              student_status: "active_student",
                              reason: "Admin restored active student status",
                            })
                          }
                        >
                          Restore Active
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
  const categorySummary = dashboard?.category_summary || [];
  const eligibleGraduation = dashboard?.eligible_graduation || [];
  const eligibleAlumniPromotion = dashboard?.eligible_alumni_promotion || [];
  const skippedAutomation = dashboard?.skipped_automation || [];

  return (
    <section className="card retreat-page lifecycle-dashboard-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Dashboard</p>
          <h2>Student Lifecycle Automation</h2>
          <p className="lede">
            Monitor the automatic flow from Active Student to Graduated and Alumni. Deferred and
            Withdrawn students are skipped by automation.
          </p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <div className="lifecycle-card-grid">
        {["active_student", "graduated", "alumni", "deferred", "withdrawn", "student", "corper"].map(
          (key) => (
            <div className="lifecycle-stat-card" key={key}>
              <span className="detail-label">{label(key)}</span>
              <strong>{counts[key] || 0}</strong>
            </div>
          ),
        )}
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
                  <td>{label(row.label)}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LifecycleTable
        title="Eligible for Graduation"
        emptyText="No students are eligible for graduation automation right now."
        rows={eligibleGraduation}
        showActions
        onRunAction={onRunAction}
      />

      <LifecycleTable
        title="Graduated Awaiting Alumni Promotion"
        emptyText="No graduated students are awaiting alumni promotion right now."
        rows={eligibleAlumniPromotion}
        showActions
        onRunAction={onRunAction}
      />

      <LifecycleTable
        title="Skipped by Automation"
        emptyText="No deferred or withdrawn students found."
        rows={skippedAutomation}
        showActions
        onRunAction={onRunAction}
      />
    </section>
  );
}
