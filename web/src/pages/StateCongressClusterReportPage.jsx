import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const statuses = ["Guest", "Member", "Worker", "Associate Coord"];

export default function StateCongressClusterReportPage({
  user,
  canViewAdmin,
  status,
  stateCongressClusterFilters,
  setStateCongressClusterFilters,
  stateCongressClusterData,
  loadStateCongressClusterReport,
  clusters,
  stateCongressSettings,
  states,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  const normalizeStatus = (value) => {
    if (!value) return "Guest";
    const normalized = String(value).toLowerCase();
    if (normalized === "associate coordinator" || normalized === "associate coord") {
      return "Associate Coord";
    }
    const match = statuses.find(
      (statusItem) => statusItem.toLowerCase() === normalized
    );
    return match || "Guest";
  };

  const reportMatrix = useMemo(() => {
    const clustersList = stateCongressClusterFilters.state ? clusters : [];
    const byCluster = new Map();
    clustersList.forEach((cluster) => {
      byCluster.set(cluster, {});
    });
    stateCongressClusterData.forEach((row) => {
      const cluster = row.cluster || "Unknown";
      const membership = normalizeStatus(row.membership_status);
      const gender = (row.gender || "").toLowerCase();
      if (!byCluster.has(cluster)) {
        byCluster.set(cluster, {});
      }
      const clusterData = byCluster.get(cluster);
      if (!clusterData[membership]) {
        clusterData[membership] = { male: 0, female: 0 };
      }
      if (gender === "male") {
        clusterData[membership].male += Number(row.total) || 0;
      } else if (gender === "female") {
        clusterData[membership].female += Number(row.total) || 0;
      }
    });
    return Array.from(byCluster.entries()).map(([cluster, values]) => ({
      cluster,
      values,
    }));
  }, [stateCongressClusterData, clusters, stateCongressClusterFilters.state]);

  const totals = useMemo(() => {
    const totalsByStatus = {};
    statuses.forEach((item) => {
      totalsByStatus[item] = { male: 0, female: 0 };
    });
    stateCongressClusterData.forEach((row) => {
      const membership = normalizeStatus(row.membership_status);
      if (!totalsByStatus[membership]) {
        totalsByStatus[membership] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        totalsByStatus[membership].male += Number(row.total) || 0;
      } else if (gender === "female") {
        totalsByStatus[membership].female += Number(row.total) || 0;
      }
    });
    return totalsByStatus;
  }, [stateCongressClusterData]);

  const buildRows = () => {
    const headerRow = ["Cluster"];
    statuses.forEach((item) => {
      headerRow.push(item, "", "");
    });
    headerRow.push("GT");

    const subHeaderRow = [""];
    statuses.forEach(() => {
      subHeaderRow.push("F", "M", "T");
    });
    subHeaderRow.push("");

    const rows = [headerRow, subHeaderRow];

    reportMatrix.forEach((row) => {
      let grandTotal = 0;
      const line = [row.cluster];
      statuses.forEach((item) => {
        const male = row.values[item]?.male || 0;
        const female = row.values[item]?.female || 0;
        const total = male + female;
        grandTotal += total;
        line.push(String(female), String(male), String(total));
      });
      line.push(String(grandTotal));
      rows.push(line);
    });

    const totalLine = ["Total"];
    let grand = 0;
    statuses.forEach((item) => {
      const male = totals[item]?.male || 0;
      const female = totals[item]?.female || 0;
      const total = male + female;
      grand += total;
      totalLine.push(String(female), String(male), String(total));
    });
    totalLine.push(String(grand));
    rows.push(totalLine);

    return rows;
  };

  const downloadXlsx = () => {
    if (!reportMatrix.length) return;
    const rows = buildRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const start = stateCongressSettings?.start_date || "start";
    const end = stateCongressSettings?.end_date || "end";
    XLSX.writeFile(
      workbook,
      `state-congress-membership-cluster-${start}-to-${end}.xlsx`
    );
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">State Congress Reports</p>
          <h2>Membership Status by Cluster</h2>
          <p className="lede">Guests, members, workers, associate coordinators.</p>
        </div>
        <Link className="ghost" to="/admin">
          Back to Admin
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Filters</h3>
            <p className="lede">Select state to filter the report.</p>
          </div>
        </div>
        <form onSubmit={loadStateCongressClusterReport} className="form">
          <div className="grid">
            <label>
              State
              <select
                value={stateCongressClusterFilters.state}
                onChange={(e) =>
                  setStateCongressClusterFilters({
                    ...stateCongressClusterFilters,
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
          <button
            type="button"
            className="btn-outline"
            onClick={downloadXlsx}
            disabled={!reportMatrix.length}
          >
            Download Excel
          </button>
        </div>
        <div className="report">
          {reportMatrix.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table className="attendance-report-table">
              <thead>
                <tr>
                  <th rowSpan="2">Cluster</th>
                  {statuses.map((item) => (
                    <th key={item} colSpan="3">
                      {item}
                    </th>
                  ))}
                  <th rowSpan="2">GT</th>
                </tr>
                <tr>
                  {statuses.flatMap((item) => [
                    <th key={`${item}-f`}>F</th>,
                    <th key={`${item}-m`}>M</th>,
                    <th key={`${item}-t`}>T</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => {
                  let grandTotal = 0;
                  return (
                    <tr key={row.cluster}>
                      <td>{row.cluster}</td>
                      {statuses.flatMap((item) => {
                        const male = row.values[item]?.male || 0;
                        const female = row.values[item]?.female || 0;
                        const total = male + female;
                        grandTotal += total;
                        return [
                          <td key={`${row.cluster}-${item}-f`}>{female}</td>,
                          <td key={`${row.cluster}-${item}-m`}>{male}</td>,
                          <td key={`${row.cluster}-${item}-t`}>{total}</td>,
                        ];
                      })}
                      <td>{grandTotal}</td>
                    </tr>
                  );
                })}
                <tr className="report-total-row">
                  <td>Total</td>
                  {statuses.flatMap((item) => {
                    const male = totals[item]?.male || 0;
                    const female = totals[item]?.female || 0;
                    const total = male + female;
                    return [
                      <td key={`${item}-total-f`}>{female}</td>,
                      <td key={`${item}-total-m`}>{male}</td>,
                      <td key={`${item}-total-t`}>{total}</td>,
                    ];
                  })}
                  <td>
                    {statuses.reduce((sum, item) => {
                      const male = totals[item]?.male || 0;
                      const female = totals[item]?.female || 0;
                      return sum + male + female;
                    }, 0)}
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
