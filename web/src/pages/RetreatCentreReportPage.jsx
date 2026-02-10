import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const categories = ["Corper", "Student", "Staff", "Children", "Youth"];

export default function RetreatCentreReportPage({
  user,
  canViewAdmin,
  status,
  retreatCentreFilters,
  setRetreatCentreFilters,
  retreatCentreData,
  loadRetreatCentreReport,
  states,
  retreatCentreRegions,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  const reportMatrix = useMemo(() => {
    const byCentre = new Map();
    retreatCentreData.forEach((row) => {
      const centre = row.dlcf_center || "Unknown Centre";
      if (!byCentre.has(centre)) {
        byCentre.set(centre, {});
      }
      const centreData = byCentre.get(centre);
      const category = row.category || "";
      if (!centreData[category]) {
        centreData[category] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        centreData[category].male += Number(row.total) || 0;
      } else if (gender === "female") {
        centreData[category].female += Number(row.total) || 0;
      }
    });
    return Array.from(byCentre.entries()).map(([centre, values]) => ({
      centre,
      values,
    }));
  }, [retreatCentreData]);

  const totals = useMemo(() => {
    const totalsByCategory = {};
    categories.forEach((category) => {
      totalsByCategory[category] = { male: 0, female: 0 };
    });
    retreatCentreData.forEach((row) => {
      const category = row.category || "";
      if (!totalsByCategory[category]) {
        totalsByCategory[category] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        totalsByCategory[category].male += Number(row.total) || 0;
      } else if (gender === "female") {
        totalsByCategory[category].female += Number(row.total) || 0;
      }
    });
    return totalsByCategory;
  }, [retreatCentreData]);

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Retreat Reports</p>
          <h2>Attendance by Fellowship Centre</h2>
          <p className="lede">Summary by centre and category.</p>
        </div>
        <Link className="ghost" to="/retreat-report">
          Back to Retreat Reports
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Filters</h3>
            <p className="lede">Select retreat type and date range.</p>
          </div>
        </div>
        <form onSubmit={loadRetreatCentreReport} className="form">
          <div className="grid">
            <label>
              Retreat Type
              <select
                value={retreatCentreFilters.retreat_type}
                onChange={(e) =>
                  setRetreatCentreFilters({
                    ...retreatCentreFilters,
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
                value={retreatCentreFilters.state}
                onChange={(e) =>
                  setRetreatCentreFilters({
                    ...retreatCentreFilters,
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
                value={retreatCentreFilters.region}
                onChange={(e) =>
                  setRetreatCentreFilters({
                    ...retreatCentreFilters,
                    region: e.target.value,
                  })
                }
                disabled={!retreatCentreFilters.state}
              >
                <option value="">All</option>
                {retreatCentreRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start Date
              <input
                type="date"
                value={retreatCentreFilters.start}
                onChange={(e) =>
                  setRetreatCentreFilters({
                    ...retreatCentreFilters,
                    start: e.target.value,
                  })
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={retreatCentreFilters.end}
                onChange={(e) =>
                  setRetreatCentreFilters({
                    ...retreatCentreFilters,
                    end: e.target.value,
                  })
                }
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
              {reportMatrix.length
                ? `${reportMatrix.length} centres loaded.`
                : "No records loaded yet."}
            </p>
          </div>
        </div>
        <div className="report">
          {reportMatrix.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table className="attendance-report-table">
              <thead>
                <tr>
                  <th rowSpan="2">DLCF Center</th>
                  {categories.map((category) => (
                    <th key={category} colSpan="3">
                      {category}
                    </th>
                  ))}
                  <th rowSpan="2">Total</th>
                </tr>
                <tr>
                  {categories.flatMap((category) => [
                    <th key={`${category}-m`}>M</th>,
                    <th key={`${category}-f`}>F</th>,
                    <th key={`${category}-t`}>T</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => {
                  const overallTotal = categories.reduce((sum, category) => {
                    const male = row.values[category]?.male || 0;
                    const female = row.values[category]?.female || 0;
                    return sum + male + female;
                  }, 0);
                  return (
                    <tr key={row.centre}>
                      <td>{row.centre}</td>
                      {categories.flatMap((category) => {
                        const male = row.values[category]?.male || 0;
                        const female = row.values[category]?.female || 0;
                        const total = male + female;
                        return [
                          <td key={`${row.centre}-${category}-m`}>{male}</td>,
                          <td key={`${row.centre}-${category}-f`}>{female}</td>,
                          <td key={`${row.centre}-${category}-t`}>{total}</td>,
                        ];
                      })}
                      <td>{overallTotal}</td>
                    </tr>
                  );
                })}
                <tr className="report-total-row">
                  <td>Total</td>
                  {categories.flatMap((category) => {
                    const male = totals[category]?.male || 0;
                    const female = totals[category]?.female || 0;
                    const total = male + female;
                    return [
                      <td key={`${category}-total-m`}>{male}</td>,
                      <td key={`${category}-total-f`}>{female}</td>,
                      <td key={`${category}-total-t`}>{total}</td>,
                    ];
                  })}
                  <td>
                    {categories.reduce(
                      (sum, category) =>
                        sum +
                        (totals[category]?.male || 0) +
                        (totals[category]?.female || 0),
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
