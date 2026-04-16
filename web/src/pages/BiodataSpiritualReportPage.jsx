import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BiodataSpiritualReportPage({ user, canManageBiodata, status, report, loadReport }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canManageBiodata) {
      navigate("/");
      return;
    }
    loadReport();
  }, [user, canManageBiodata]);

  if (!user || !canManageBiodata) return null;

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Report</p>
          <h2>Spiritual Tracking Report</h2>
          <p className="lede">Leadership-only summary of spiritual milestone progress.</p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <div className="report-card card">
        <div className="details-grid">
          <div>
            <span className="detail-label">Total Members</span>
            <span className="detail-value">{report?.total || 0}</span>
          </div>
        </div>
        <table className="data-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Yes</th>
              <th>No</th>
              <th>% Yes</th>
            </tr>
          </thead>
          <tbody>
            {(report?.items || []).map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.yes}</td>
                <td>{item.no}</td>
                <td>{item.percentage_yes}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
