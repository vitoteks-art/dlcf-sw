import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiFetch } from "../api";

const categories = ["Student", "Children", "Corper", "Staff", "Others", "Youth"];

export default function StateCongressCategoryReportPage({
  user,
  canViewAdmin,
  status,
  stateCongressCategoryFilters,
  setStateCongressCategoryFilters,
  stateCongressCategoryData,
  loadStateCongressCategoryReport,
  stateCongressCategoryRegions,
  stateCongressSettings,
  states,
}) {
  const navigate = useNavigate();
  const [regionsOverride, setRegionsOverride] = useState([]);

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  useEffect(() => {
    if (!stateCongressCategoryFilters.state) {
      setRegionsOverride([]);
      return;
    }
    apiFetch(
      `/meta/regions?state=${encodeURIComponent(stateCongressCategoryFilters.state)}`
    )
      .then((data) => setRegionsOverride(data.items || []))
      .catch(() => setRegionsOverride([]));
  }, [stateCongressCategoryFilters.state]);

  const normalizeCategory = (value) => {
    if (!value) return "Others";
    const match = categories.find(
      (category) => category.toLowerCase() === String(value).toLowerCase()
    );
    return match || "Others";
  };

  const reportMatrix = useMemo(() => {
    const preferredRegions = regionsOverride.length
      ? regionsOverride
      : stateCongressCategoryRegions;
    const regionsList =
      stateCongressCategoryFilters.state && preferredRegions.length
        ? preferredRegions
        : Array.from(
            new Set(
              stateCongressCategoryData.map((row) => row.region || "Unknown")
            )
          );
    const byRegion = new Map();
    regionsList.forEach((region) => {
      byRegion.set(region, {});
    });
    stateCongressCategoryData.forEach((row) => {
      const region = row.region || "Unknown";
      const category = normalizeCategory(row.category);
      const gender = (row.gender || "").toLowerCase();
      if (!byRegion.has(region)) {
        byRegion.set(region, {});
      }
      const regionData = byRegion.get(region);
      if (!regionData[category]) {
        regionData[category] = { male: 0, female: 0 };
      }
      if (gender === "male") {
        regionData[category].male += Number(row.total) || 0;
      } else if (gender === "female") {
        regionData[category].female += Number(row.total) || 0;
      }
    });
    return Array.from(byRegion.entries()).map(([region, values]) => ({
      region,
      values,
    }));
  }, [
    stateCongressCategoryData,
    stateCongressCategoryFilters.state,
    stateCongressCategoryRegions,
  ]);

  const totals = useMemo(() => {
    const totalsByCategory = {};
    categories.forEach((category) => {
      totalsByCategory[category] = { male: 0, female: 0 };
    });
    stateCongressCategoryData.forEach((row) => {
      const category = normalizeCategory(row.category);
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
  }, [stateCongressCategoryData]);

  const buildRows = () => {
    const headerRow = ["Region"];
    categories.forEach((category) => {
      headerRow.push(category, "", "");
    });
    headerRow.push("GT");

    const subHeaderRow = [""];
    categories.forEach(() => {
      subHeaderRow.push("F", "M", "T");
    });
    subHeaderRow.push("");

    const rows = [headerRow, subHeaderRow];

    reportMatrix.forEach((row) => {
      let grandTotal = 0;
      const line = [row.region];
      categories.forEach((category) => {
        const male = row.values[category]?.male || 0;
        const female = row.values[category]?.female || 0;
        const total = male + female;
        grandTotal += total;
        line.push(String(female), String(male), String(total));
      });
      line.push(String(grandTotal));
      rows.push(line);
    });

    const totalLine = ["Total"];
    let grand = 0;
    categories.forEach((category) => {
      const male = totals[category]?.male || 0;
      const female = totals[category]?.female || 0;
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
      `state-congress-category-report-${start}-to-${end}.xlsx`
    );
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">State Congress Reports</p>
          <h2>Category Summary by Region</h2>
          <p className="lede">Membership categories by region.</p>
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
        <form onSubmit={loadStateCongressCategoryReport} className="form">
          <div className="grid">
            <label>
              State
              <select
                value={stateCongressCategoryFilters.state}
                onChange={(e) =>
                  setStateCongressCategoryFilters({
                    ...stateCongressCategoryFilters,
                    state: e.target.value,
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
                ? `${reportMatrix.length} regions loaded.`
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
                  <th rowSpan="2">Region</th>
                  {categories.map((category) => (
                    <th key={category} colSpan="3">
                      {category}
                    </th>
                  ))}
                  <th rowSpan="2">GT</th>
                </tr>
                <tr>
                  {categories.flatMap((category) => [
                    <th key={`${category}-f`}>F</th>,
                    <th key={`${category}-m`}>M</th>,
                    <th key={`${category}-t`}>T</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => {
                  let grandTotal = 0;
                  return (
                    <tr key={row.region}>
                      <td>{row.region}</td>
                      {categories.flatMap((category) => {
                        const male = row.values[category]?.male || 0;
                        const female = row.values[category]?.female || 0;
                        const total = male + female;
                        grandTotal += total;
                        return [
                          <td key={`${row.region}-${category}-f`}>{female}</td>,
                          <td key={`${row.region}-${category}-m`}>{male}</td>,
                          <td key={`${row.region}-${category}-t`}>{total}</td>,
                        ];
                      })}
                      <td>{grandTotal}</td>
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
                      <td key={`${category}-total-f`}>{female}</td>,
                      <td key={`${category}-total-m`}>{male}</td>,
                      <td key={`${category}-total-t`}>{total}</td>,
                    ];
                  })}
                  <td>
                    {categories.reduce((sum, category) => {
                      const male = totals[category]?.male || 0;
                      const female = totals[category]?.female || 0;
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
