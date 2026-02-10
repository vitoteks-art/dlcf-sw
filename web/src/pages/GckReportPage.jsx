import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function GckReportPage({
  user,
  status,
  gckSummaryFilters,
  setGckSummaryFilters,
  gckSummaryRegions,
  loadGckSummary,
  gckSummary,
  states,
  gckSummaryMeta,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const sessions = useMemo(() => {
    const map = new Map();
    gckSummary.forEach((row) => {
      const label = row.session_label || "Session";
      const date = row.session_date || "";
      const key = `${label}|${date}`;
      if (!map.has(key)) {
        map.set(key, { label, date });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.date || "").localeCompare(b.date || "")
    );
  }, [gckSummary]);

  const reportMatrix = useMemo(() => {
    const byCentre = new Map();
    gckSummary.forEach((row) => {
      const centre = row.fellowship_centre || "Unknown Centre";
      if (!byCentre.has(centre)) {
        byCentre.set(centre, {});
      }
      const centreData = byCentre.get(centre);
      const label = row.session_label || "Session";
      const date = row.session_date || "";
      const sessionKey = `${label}|${date}`;
      if (!centreData[sessionKey]) {
        centreData[sessionKey] = {};
      }
      const key = `${row.category || ""}:${row.gender || ""}`;
      centreData[sessionKey][key] = Number(row.total) || 0;
    });
    return Array.from(byCentre.entries()).map(([centre, values]) => ({
      centre,
      values,
    }));
  }, [gckSummary]);

  const totalsBySession = useMemo(() => {
    const totals = {};
    sessions.forEach((session) => {
      const sessionKey = `${session.label}|${session.date}`;
      totals[sessionKey] = {
        "adult:male": 0,
        "adult:female": 0,
        "youth:male": 0,
        "youth:female": 0,
        "children:male": 0,
        "children:female": 0,
      };
    });
    gckSummary.forEach((row) => {
      const label = row.session_label || "Session";
      const date = row.session_date || "";
      const sessionKey = `${label}|${date}`;
      const key = `${row.category || ""}:${row.gender || ""}`;
      if (totals[sessionKey] && totals[sessionKey][key] !== undefined) {
        totals[sessionKey][key] += Number(row.total) || 0;
      }
    });
    return totals;
  }, [gckSummary, sessions]);

  const buildWorksheetData = () => {
    const metaRows = [
      ["GROUP NAME", gckSummaryMeta?.group_name || "DLCF"],
      [
        "GROUP COORDINATOR",
        gckSummaryMeta?.coordinator_name || "State Coordinator",
      ],
      [
        "MONTH",
        gckSummaryMeta?.report_month || gckSummaryFilters.report_month || "",
      ],
    ];
    const headers = ["S/N", "DISTRICT"];
    sessions.forEach((session) => {
      const label = session.date
        ? `${session.label} (${session.date})`
        : session.label;
      ["Adult", "Youth", "Children"].forEach((category) => {
        ["M", "F"].forEach((gender) => {
          headers.push(`${label} ${category} ${gender}`);
        });
      });
      headers.push(`${label} Total`);
    });

    const rows = reportMatrix.map((row, index) => {
      const cells = [index + 1, row.centre];
      sessions.forEach((session) => {
        const sessionKey = `${session.label}|${session.date}`;
        const adultMale = row.values[sessionKey]?.["adult:male"] || 0;
        const adultFemale = row.values[sessionKey]?.["adult:female"] || 0;
        const youthMale = row.values[sessionKey]?.["youth:male"] || 0;
        const youthFemale = row.values[sessionKey]?.["youth:female"] || 0;
        const childrenMale = row.values[sessionKey]?.["children:male"] || 0;
        const childrenFemale = row.values[sessionKey]?.["children:female"] || 0;
        const total =
          adultMale +
          adultFemale +
          youthMale +
          youthFemale +
          childrenMale +
          childrenFemale;
        cells.push(
          adultMale,
          adultFemale,
          youthMale,
          youthFemale,
          childrenMale,
          childrenFemale,
          total
        );
      });
      return cells;
    });

    const totalsRow = ["TOTAL", ""];
    sessions.forEach((session) => {
      const sessionKey = `${session.label}|${session.date}`;
      const adultMale = totalsBySession[sessionKey]?.["adult:male"] || 0;
      const adultFemale = totalsBySession[sessionKey]?.["adult:female"] || 0;
      const youthMale = totalsBySession[sessionKey]?.["youth:male"] || 0;
      const youthFemale = totalsBySession[sessionKey]?.["youth:female"] || 0;
      const childrenMale = totalsBySession[sessionKey]?.["children:male"] || 0;
      const childrenFemale = totalsBySession[sessionKey]?.["children:female"] || 0;
      const total =
        adultMale +
        adultFemale +
        youthMale +
        youthFemale +
        childrenMale +
        childrenFemale;
      totalsRow.push(
        adultMale,
        adultFemale,
        youthMale,
        youthFemale,
        childrenMale,
        childrenFemale,
        total
      );
    });

    return [...metaRows, [], headers, ...rows, totalsRow];
  };

  const handleDownload = () => {
    if (!reportMatrix.length) {
      return;
    }
    const data = buildWorksheetData();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GCK Report");
    XLSX.writeFile(workbook, "gck-attendance-report.xlsx", {
      bookType: "xlsx",
    });
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">GCK Reports</p>
          <h2>Global Crusade Attendance Report</h2>
          <p className="lede">Filter and review monthly GCK submissions.</p>
        </div>
        <Link className="ghost" to="/gck">
          Back to GCK Attendance
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Filters</h3>
            <p className="lede">Select the report month and location.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={!reportMatrix.length}
          >
            Download Excel (.xlsx)
          </button>
        </div>
        <form onSubmit={loadGckSummary} className="form">
          <div className="grid">
            <label>
              Report Month
              <input
                type="month"
                value={gckSummaryFilters.report_month}
                onChange={(e) =>
                  setGckSummaryFilters({
                    ...gckSummaryFilters,
                    report_month: e.target.value,
                  })
                }
              />
            </label>
            <label>
              State
              <select
                value={gckSummaryFilters.state}
                onChange={(e) =>
                  setGckSummaryFilters({
                    ...gckSummaryFilters,
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
                value={gckSummaryFilters.region}
                onChange={(e) =>
                  setGckSummaryFilters({
                    ...gckSummaryFilters,
                    region: e.target.value,
                  })
                }
                disabled={!gckSummaryFilters.state}
              >
                <option value="">All</option>
                {gckSummaryRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
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
              {reportMatrix.length
                ? `${reportMatrix.length} districts loaded.`
                : "No records loaded yet."}
            </p>
          </div>
        </div>
        <div className="report-meta">
          <div>
            <span className="report-meta-label">Group Name</span>
            <span>{gckSummaryMeta?.group_name || "DLCF"}</span>
          </div>
          <div>
            <span className="report-meta-label">Group Coordinator</span>
            <span>{gckSummaryMeta?.coordinator_name || "State Coordinator"}</span>
          </div>
          <div>
            <span className="report-meta-label">Month</span>
            <span>
              {gckSummaryMeta?.report_month ||
                gckSummaryFilters.report_month ||
                "-"}
            </span>
          </div>
        </div>
        <div className="report">
          {reportMatrix.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table className="attendance-report-table">
              <thead>
                <tr>
                  <th rowSpan="3">S/N</th>
                  <th rowSpan="3">District</th>
                  {sessions.map((session) => (
                    <th
                      key={`${session.label}-${session.date}`}
                      colSpan="7"
                    >
                      {session.label}
                      {session.date ? ` (${session.date})` : ""}
                    </th>
                  ))}
                </tr>
                <tr>
                  {sessions.flatMap((session) => [
                    <th key={`${session.label}-${session.date}-adult`} colSpan="2">
                      Adult
                    </th>,
                    <th key={`${session.label}-${session.date}-youth`} colSpan="2">
                      Youth
                    </th>,
                    <th
                      key={`${session.label}-${session.date}-children`}
                      colSpan="2"
                    >
                      Children
                    </th>,
                    <th
                      key={`${session.label}-${session.date}-total`}
                      rowSpan="2"
                    >
                      Total
                    </th>,
                  ])}
                </tr>
                <tr>
                  {sessions.flatMap((session) => [
                    <th key={`${session.label}-${session.date}-adult-m`}>M</th>,
                    <th key={`${session.label}-${session.date}-adult-f`}>F</th>,
                    <th key={`${session.label}-${session.date}-youth-m`}>M</th>,
                    <th key={`${session.label}-${session.date}-youth-f`}>F</th>,
                    <th
                      key={`${session.label}-${session.date}-children-m`}
                    >
                      M
                    </th>,
                    <th
                      key={`${session.label}-${session.date}-children-f`}
                    >
                      F
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row, idx) => (
                  <tr key={`${row.centre}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{row.centre}</td>
                    {sessions.flatMap((session) => {
                      const sessionKey = `${session.label}|${session.date}`;
                      const adultMale =
                        row.values[sessionKey]?.["adult:male"] || 0;
                      const adultFemale =
                        row.values[sessionKey]?.["adult:female"] || 0;
                      const youthMale =
                        row.values[sessionKey]?.["youth:male"] || 0;
                      const youthFemale =
                        row.values[sessionKey]?.["youth:female"] || 0;
                      const childrenMale =
                        row.values[sessionKey]?.["children:male"] || 0;
                      const childrenFemale =
                        row.values[sessionKey]?.["children:female"] || 0;
                      const total =
                        adultMale +
                        adultFemale +
                        youthMale +
                        youthFemale +
                        childrenMale +
                        childrenFemale;
                      return [
                        <td key={`${row.centre}-${sessionKey}-adult-m`}>
                          {adultMale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-adult-f`}>
                          {adultFemale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-youth-m`}>
                          {youthMale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-youth-f`}>
                          {youthFemale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-children-m`}>
                          {childrenMale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-children-f`}>
                          {childrenFemale}
                        </td>,
                        <td key={`${row.centre}-${sessionKey}-total`}>{total}</td>,
                      ];
                    })}
                  </tr>
                ))}
                <tr className="report-total-row">
                  <td>TOTAL</td>
                  <td />
                  {sessions.flatMap((session) => {
                    const sessionKey = `${session.label}|${session.date}`;
                    const adultMale =
                      totalsBySession[sessionKey]?.["adult:male"] || 0;
                    const adultFemale =
                      totalsBySession[sessionKey]?.["adult:female"] || 0;
                    const youthMale =
                      totalsBySession[sessionKey]?.["youth:male"] || 0;
                    const youthFemale =
                      totalsBySession[sessionKey]?.["youth:female"] || 0;
                    const childrenMale =
                      totalsBySession[sessionKey]?.["children:male"] || 0;
                    const childrenFemale =
                      totalsBySession[sessionKey]?.["children:female"] || 0;
                    const total =
                      adultMale +
                      adultFemale +
                      youthMale +
                      youthFemale +
                      childrenMale +
                      childrenFemale;
                    return [
                      <td key={`${sessionKey}-total-adult-m`}>{adultMale}</td>,
                      <td key={`${sessionKey}-total-adult-f`}>{adultFemale}</td>,
                      <td key={`${sessionKey}-total-youth-m`}>{youthMale}</td>,
                      <td key={`${sessionKey}-total-youth-f`}>{youthFemale}</td>,
                      <td key={`${sessionKey}-total-children-m`}>
                        {childrenMale}
                      </td>,
                      <td key={`${sessionKey}-total-children-f`}>
                        {childrenFemale}
                      </td>,
                      <td key={`${sessionKey}-total-sum`}>{total}</td>,
                    ];
                  })}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
