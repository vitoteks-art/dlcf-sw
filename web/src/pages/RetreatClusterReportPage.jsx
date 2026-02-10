import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RetreatClusterReportPage({
  user,
  canViewAdmin,
  status,
  retreatClusterFilters,
  setRetreatClusterFilters,
  retreatClusterData,
  loadRetreatClusterReport,
  clusters,
  retreatClusterRegions,
  states,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  const days = useMemo(
    () => [
      { key: "day1", label: "Day 1", date: retreatClusterFilters.day1 },
      { key: "day2", label: "Day 2", date: retreatClusterFilters.day2 },
      { key: "day3", label: "Day 3", date: retreatClusterFilters.day3 },
      { key: "day4", label: "Day 4", date: retreatClusterFilters.day4 },
    ],
    [
      retreatClusterFilters.day1,
      retreatClusterFilters.day2,
      retreatClusterFilters.day3,
      retreatClusterFilters.day4,
    ]
  );

  const reportMatrix = useMemo(() => {
    const byCluster = new Map();
    clusters.forEach((cluster) => {
      byCluster.set(cluster, {});
    });
    retreatClusterData.forEach((row) => {
      const cluster = row.cluster || "Unknown";
      if (!byCluster.has(cluster)) {
        byCluster.set(cluster, {});
      }
      const clusterData = byCluster.get(cluster);
      const dayKey = row.day_key || "";
      if (!clusterData[dayKey]) {
        clusterData[dayKey] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        clusterData[dayKey].male += Number(row.total) || 0;
      } else if (gender === "female") {
        clusterData[dayKey].female += Number(row.total) || 0;
      }
    });
    return Array.from(byCluster.entries()).map(([cluster, values]) => ({
      cluster,
      values,
    }));
  }, [clusters, retreatClusterData]);

  const totals = useMemo(() => {
    const totalsByDay = {};
    days.forEach((day) => {
      totalsByDay[day.key] = { male: 0, female: 0 };
    });
    retreatClusterData.forEach((row) => {
      const dayKey = row.day_key || "";
      if (!totalsByDay[dayKey]) {
        totalsByDay[dayKey] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        totalsByDay[dayKey].male += Number(row.total) || 0;
      } else if (gender === "female") {
        totalsByDay[dayKey].female += Number(row.total) || 0;
      }
    });
    return totalsByDay;
  }, [days, retreatClusterData]);

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Retreat Reports</p>
          <h2>Cluster Attendance by Day</h2>
          <p className="lede">Summary by cluster and day.</p>
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
            <p className="lede">Select retreat type and day dates.</p>
          </div>
        </div>
        <form onSubmit={loadRetreatClusterReport} className="form">
          <div className="grid">
            <label>
              Retreat Type
              <select
                value={retreatClusterFilters.retreat_type}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
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
                value={retreatClusterFilters.state}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
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
                value={retreatClusterFilters.region}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
                    region: e.target.value,
                  })
                }
                disabled={!retreatClusterFilters.state}
              >
                <option value="">All</option>
                {retreatClusterRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Day 1 Date
              <input
                type="date"
                value={retreatClusterFilters.day1}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
                    day1: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Day 2 Date
              <input
                type="date"
                value={retreatClusterFilters.day2}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
                    day2: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Day 3 Date
              <input
                type="date"
                value={retreatClusterFilters.day3}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
                    day3: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Day 4 Date
              <input
                type="date"
                value={retreatClusterFilters.day4}
                onChange={(e) =>
                  setRetreatClusterFilters({
                    ...retreatClusterFilters,
                    day4: e.target.value,
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
                ? `${reportMatrix.length} clusters loaded.`
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
                  <th rowSpan="2">Cluster</th>
                  {days.map((day) => (
                    <th key={day.key} colSpan="3">
                      {day.label}
                      {day.date ? ` (${day.date})` : ""}
                    </th>
                  ))}
                </tr>
                <tr>
                  {days.flatMap((day) => [
                    <th key={`${day.key}-m`}>M</th>,
                    <th key={`${day.key}-f`}>F</th>,
                    <th key={`${day.key}-t`}>T</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => (
                  <tr key={row.cluster}>
                    <td>{row.cluster}</td>
                    {days.flatMap((day) => {
                      const male = row.values[day.key]?.male || 0;
                      const female = row.values[day.key]?.female || 0;
                      const total = male + female;
                      return [
                        <td key={`${row.cluster}-${day.key}-m`}>{male}</td>,
                        <td key={`${row.cluster}-${day.key}-f`}>{female}</td>,
                        <td key={`${row.cluster}-${day.key}-t`}>{total}</td>,
                      ];
                    })}
                  </tr>
                ))}
                <tr className="report-total-row">
                  <td>Total</td>
                  {days.flatMap((day) => {
                    const male = totals[day.key]?.male || 0;
                    const female = totals[day.key]?.female || 0;
                    const total = male + female;
                    return [
                      <td key={`${day.key}-total-m`}>{male}</td>,
                      <td key={`${day.key}-total-f`}>{female}</td>,
                      <td key={`${day.key}-total-t`}>{total}</td>,
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
