import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function StateCongressRegionReportPage({
  user,
  canViewAdmin,
  status,
  stateCongressReportFilters,
  setStateCongressReportFilters,
  stateCongressReportData,
  loadStateCongressRegionReport,
  stateCongressReportRegions,
  stateCongressSettings,
  states,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !canViewAdmin) {
      navigate("/");
    }
  }, [user, canViewAdmin, navigate]);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const days = useMemo(() => {
    const start = stateCongressSettings?.start_date;
    const end = stateCongressSettings?.end_date;
    if (!start || !end) return [];
    const list = [];
    const [startYear, startMonth, startDay] = start.split("-").map(Number);
    const [endYear, endMonth, endDay] = end.split("-").map(Number);
    let cursor = new Date(startYear, startMonth - 1, startDay);
    const last = new Date(endYear, endMonth - 1, endDay);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
      return [];
    }
    let index = 1;
    while (cursor <= last) {
      const value = formatLocalDate(cursor);
      const labelDate = cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      list.push({
        key: `day${index}`,
        value,
        label: `Day ${index} (${labelDate})`,
      });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }
    return list;
  }, [stateCongressSettings?.start_date, stateCongressSettings?.end_date]);

  const dayKeyByDate = useMemo(() => {
    const map = new Map();
    days.forEach((day) => {
      map.set(day.value, day.key);
    });
    return map;
  }, [days]);

  const reportMatrix = useMemo(() => {
    const byRegion = new Map();
    stateCongressReportRegions.forEach((region) => {
      byRegion.set(region, {});
    });
    stateCongressReportData.forEach((row) => {
      const region = row.region || "Unknown";
      if (!byRegion.has(region)) {
        byRegion.set(region, {});
      }
      const regionData = byRegion.get(region);
      const dayKey =
        row.day_key ||
        dayKeyByDate.get(String(row.registration_date || "").slice(0, 10)) ||
        "";
      if (!dayKey) return;
      if (!regionData[dayKey]) {
        regionData[dayKey] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        regionData[dayKey].male += Number(row.total) || 0;
      } else if (gender === "female") {
        regionData[dayKey].female += Number(row.total) || 0;
      }
    });
    return Array.from(byRegion.entries()).map(([region, values]) => ({
      region,
      values,
    }));
  }, [stateCongressReportRegions, stateCongressReportData, dayKeyByDate]);

  const totals = useMemo(() => {
    const totalsByDay = {};
    days.forEach((day) => {
      totalsByDay[day.key] = { male: 0, female: 0 };
    });
    stateCongressReportData.forEach((row) => {
      const dayKey =
        row.day_key ||
        dayKeyByDate.get(String(row.registration_date || "").slice(0, 10)) ||
        "";
      if (!dayKey) return;
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
  }, [days, stateCongressReportData, dayKeyByDate]);

  const buildCsvRows = () => {
    const headerRow = ["Region"];
    days.forEach((day) => {
      headerRow.push(day.label, "", "");
    });
    headerRow.push("GT");

    const subHeaderRow = [""];
    days.forEach(() => {
      subHeaderRow.push("F", "M", "T");
    });
    subHeaderRow.push("");

    const rows = [headerRow, subHeaderRow];

    reportMatrix.forEach((row) => {
      let grandTotal = 0;
      const line = [row.region];
      days.forEach((day) => {
        const male = row.values[day.key]?.male || 0;
        const female = row.values[day.key]?.female || 0;
        const total = male + female;
        grandTotal += total;
        line.push(String(female), String(male), String(total));
      });
      line.push(String(grandTotal));
      rows.push(line);
    });

    const totalLine = ["Total"];
    let grand = 0;
    days.forEach((day) => {
      const male = totals[day.key]?.male || 0;
      const female = totals[day.key]?.female || 0;
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
    const rows = buildCsvRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const start = stateCongressSettings?.start_date || "start";
    const end = stateCongressSettings?.end_date || "end";
    XLSX.writeFile(
      workbook,
      `state-congress-region-report-${start}-to-${end}.xlsx`
    );
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">State Congress Reports</p>
          <h2>Daily Registration by Region</h2>
          <p className="lede">Summary by region and congress day.</p>
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
        <form onSubmit={loadStateCongressRegionReport} className="form">
          <div className="grid">
            <label>
              State
              <select
                value={stateCongressReportFilters.state}
                onChange={(e) =>
                  setStateCongressReportFilters({
                    ...stateCongressReportFilters,
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
            <button type="submit" disabled={days.length === 0}>
              Load Report
            </button>
          </div>
          {days.length === 0 ? (
            <p className="small-text">Set congress dates first.</p>
          ) : null}
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
                  {days.map((day) => (
                    <th key={day.key} colSpan="3">
                      {day.label}
                    </th>
                  ))}
                  <th rowSpan="2">GT</th>
                </tr>
                <tr>
                  {days.flatMap((day) => [
                    <th key={`${day.key}-f`}>F</th>,
                    <th key={`${day.key}-m`}>M</th>,
                    <th key={`${day.key}-t`}>T</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => {
                  let grandTotal = 0;
                  return (
                    <tr key={row.region}>
                      <td>{row.region}</td>
                      {days.flatMap((day) => {
                        const male = row.values[day.key]?.male || 0;
                        const female = row.values[day.key]?.female || 0;
                        const total = male + female;
                        grandTotal += total;
                        return [
                          <td key={`${row.region}-${day.key}-f`}>{female}</td>,
                          <td key={`${row.region}-${day.key}-m`}>{male}</td>,
                          <td key={`${row.region}-${day.key}-t`}>{total}</td>,
                        ];
                      })}
                      <td>{grandTotal}</td>
                    </tr>
                  );
                })}
                <tr className="report-total-row">
                  <td>Total</td>
                  {days.flatMap((day) => {
                    const male = totals[day.key]?.male || 0;
                    const female = totals[day.key]?.female || 0;
                    const total = male + female;
                    return [
                      <td key={`${day.key}-total-f`}>{female}</td>,
                      <td key={`${day.key}-total-m`}>{male}</td>,
                      <td key={`${day.key}-total-t`}>{total}</td>,
                    ];
                  })}
                  <td>
                    {days.reduce((sum, day) => {
                      const male = totals[day.key]?.male || 0;
                      const female = totals[day.key]?.female || 0;
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
