import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

function buildCsv(rows) {
  const headers = [
    "retreat_type",
    "title",
    "full_name",
    "gender",
    "email",
    "phone",
    "category",
    "membership_status",
    "cluster",
    "dlcf_center",
    "registration_date",
    "state",
    "region",
    "fellowship_centre",
  ];

  const escapeCell = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    if (text.includes('"') || text.includes(",") || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((key) => escapeCell(row[key])).join(",")
    ),
  ];

  return lines.join("\n");
}

export default function RetreatReportPage({
  user,
  canViewAdmin,
  status,
  retreatReport,
  setRetreatReport,
  retreatReportRegions,
  retreatReportData,
  loadRetreatReport,
  clusters,
  states,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  const filename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `retreat-report-${stamp}.csv`;
  }, []);

  const handleDownload = () => {
    if (!retreatReportData.length) {
      return;
    }
    const csv = buildCsv(retreatReportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Retreat Reports</p>
          <h2>Retreat Registration Report</h2>
          <p className="lede">
            Filter retreat registrations and export the results.
          </p>
        </div>
        <Link className="ghost" to="/admin">
          Back to Admin
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Filters</h3>
            <p className="lede">Narrow results by date, retreat, and cluster.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={!retreatReportData.length}
          >
            Download CSV
          </button>
        </div>
        <form onSubmit={loadRetreatReport} className="form">
          <div className="grid">
            <label>
              Start Date
              <input
                type="date"
                value={retreatReport.start}
                onChange={(e) =>
                  setRetreatReport({ ...retreatReport, start: e.target.value })
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={retreatReport.end}
                onChange={(e) =>
                  setRetreatReport({ ...retreatReport, end: e.target.value })
                }
              />
            </label>
            <label>
              Retreat Type
              <select
                value={retreatReport.retreat_type}
                onChange={(e) =>
                  setRetreatReport({
                    ...retreatReport,
                    retreat_type: e.target.value,
                  })
                }
              >
                <option value="">All</option>
                <option value="easter">Easter Retreat</option>
                <option value="december">December Retreat</option>
              </select>
            </label>
            <label>
              State
              <select
                value={retreatReport.state}
                onChange={(e) =>
                  setRetreatReport({
                    ...retreatReport,
                    state: e.target.value,
                    region: "",
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
                value={retreatReport.region}
                onChange={(e) =>
                  setRetreatReport({
                    ...retreatReport,
                    region: e.target.value,
                  })
                }
                disabled={!retreatReport.state}
              >
                <option value="">All</option>
                {retreatReportRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cluster
              <select
                value={retreatReport.cluster}
                onChange={(e) =>
                  setRetreatReport({ ...retreatReport, cluster: e.target.value })
                }
              >
                <option value="">All</option>
                {clusters.map((cluster) => (
                  <option key={cluster} value={cluster}>
                    {cluster}
                  </option>
                ))}
              </select>
            </label>
            <label>
              DLCF Center
              <input
                type="text"
                value={retreatReport.dlcf_center}
                onChange={(e) =>
                  setRetreatReport({
                    ...retreatReport,
                    dlcf_center: e.target.value,
                  })
                }
                placeholder="Enter center name"
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit">Load Report</button>
          </div>
        </form>
      </section>

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Results</h3>
            <p className="lede">
              {retreatReportData.length
                ? `${retreatReportData.length} records loaded.`
                : "No records loaded yet."}
            </p>
          </div>
        </div>
        <div className="report">
          {retreatReportData.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Retreat</th>
                  <th>Category</th>
                  <th>Cluster</th>
                  <th>State</th>
                  <th>Centre</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {retreatReportData.map((row, idx) => (
                  <tr key={`${row.email || row.phone || "row"}-${idx}`}>
                    <td>{row.full_name || "-"}</td>
                    <td>{row.retreat_type || "-"}</td>
                    <td>{row.category || "-"}</td>
                    <td>{row.cluster || "-"}</td>
                    <td>{row.state || "-"}</td>
                    <td>{row.fellowship_centre || row.dlcf_center || "-"}</td>
                    <td>{row.registration_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
