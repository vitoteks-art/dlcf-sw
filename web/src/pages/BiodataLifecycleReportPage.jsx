import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function prettyLabel(field, value) {
  const labels = {
    category: {
      staff: "Staff",
      student: "Student",
      corper: "Corper",
      youth: "Youth",
      children: "Children",
      unspecified: "Unspecified",
      Unspecified: "Unspecified",
    },
    student_status: {
      active_student: "Active Student",
      graduated: "Graduated",
      alumni_ready: "Alumni Ready",
      alumni: "Alumni",
      deferred: "Deferred",
      withdrawn: "Withdrawn",
      Unspecified: "Unspecified",
    },
    nysc_status: {
      none: "No NYSC",
      serving: "Serving",
      completed: "Completed",
      Unspecified: "Unspecified",
    },
    academic_level: {
      Unspecified: "Unspecified",
    },
    program_type: {
      Unspecified: "Unspecified",
    },
    expected_graduation_year: {
      Unspecified: "Unspecified",
    },
  };

  return labels[field]?.[value] || value;
}

export default function BiodataLifecycleReportPage({
  user,
  canManageBiodata,
  status,
  report,
  dashboard,
  loadReport,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canManageBiodata) {
      navigate("/");
      return;
    }
    loadReport();
  }, [user, canManageBiodata]);

  if (!user || !canManageBiodata) return null;

  const renderTable = (title, rows, field) => (
    <div className="card" style={{ marginTop: 16 }}>
      <h4>{title}</h4>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((row) => (
              <tr key={`${field}-${row.label}`}>
                <td>{prettyLabel(field, row.label)}</td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Report</p>
          <h2>Lifecycle Report</h2>
          <p className="lede">Leadership-only view of academic, alumni, and NYSC distribution.</p>
        </div>
        <div className="actions-cell">
          <Link className="ghost" to="/biodata-dashboard/alumni">
            Open Alumni Dashboard
          </Link>
          <Link className="ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>
      {status ? <div className="status">{status}</div> : null}
      {renderTable("Category Summary", dashboard?.category_summary, "category")}
      {renderTable("Student Status Summary", report, "student_status")}
      {renderTable("NYSC Status Summary", dashboard?.nysc_summary, "nysc_status")}
      {renderTable("Program Type Summary", dashboard?.program_summary, "program_type")}
      {renderTable("Academic Level Summary", dashboard?.academic_summary, "academic_level")}
      {renderTable(
        "Expected Graduation Year Summary",
        dashboard?.graduation_year_summary,
        "expected_graduation_year"
      )}
    </section>
  );
}
