import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function summarize(items, field) {
  const map = new Map();
  (items || []).forEach((row) => {
    const key = row[field] || "Unspecified";
    map.set(key, (map.get(key) || 0) + Number(row.total || 0));
  });
  return Array.from(map.entries());
}

function prettyLabel(field, value) {
  const labels = {
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
  };

  return labels[field]?.[value] || value;
}

export default function BiodataLifecycleReportPage({ user, canManageBiodata, status, report, loadReport }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canManageBiodata) {
      navigate("/");
      return;
    }
    loadReport();
  }, [user, canManageBiodata]);

  if (!user || !canManageBiodata) return null;

  const programTypes = summarize(report, "program_type");
  const academicLevels = summarize(report, "academic_level");
  const studentStatuses = summarize(report, "student_status");
  const nyscStatuses = summarize(report, "nysc_status");

  const renderTable = (title, rows, field) => (
    <div className="card" style={{ marginTop: 16 }}>
      <h4>{title}</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, total]) => (
            <tr key={label}>
              <td>{prettyLabel(field, label)}</td>
              <td>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Report</p>
          <h2>Lifecycle Report</h2>
          <p className="lede">Leadership-only view of academic and NYSC member distribution.</p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      {renderTable("Program Type Summary", programTypes, "program_type")}
      {renderTable("Academic Level Summary", academicLevels, "academic_level")}
      {renderTable("Student Status Summary", studentStatuses, "student_status")}
      {renderTable("NYSC Status Summary", nyscStatuses, "nysc_status")}
    </section>
  );
}
