import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function ZonalDailyReportPage({
  user,
  canViewAdmin,
  status,
  zonalDailyFilters,
  setZonalDailyFilters,
  zonalDailyData,
  loadZonalDailyReport,
  zonalSettings,
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
    const start = zonalSettings?.start_date;
    const end = zonalSettings?.end_date;
    if (!start || !end) return [];
    const [startYear, startMonth, startDay] = start.split("-").map(Number);
    const [endYear, endMonth, endDay] = end.split("-").map(Number);
    let cursor = new Date(startYear, startMonth - 1, startDay);
    const last = new Date(endYear, endMonth - 1, endDay);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
      return [];
    }
    const list = [];
    let index = 1;
    while (cursor <= last) {
      const value = formatLocalDate(cursor);
      const labelDate = cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      list.push({ key: `day${index}`, value, label: `Day ${index} (${labelDate})` });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }
    return list;
  }, [zonalSettings?.start_date, zonalSettings?.end_date]);

  const dayKeyByDate = useMemo(() => {
    const map = new Map();
    days.forEach((day) => {
      map.set(day.value, day.key);
    });
    return map;
  }, [days]);

  const reportMatrix = useMemo(() => {
    const stateList = zonalDailyFilters.state
      ? [zonalDailyFilters.state]
      : states;
    const byState = new Map();
    stateList.forEach((state) => {
      byState.set(state, {});
    });
    zonalDailyData.forEach((row) => {
      const state = row.state || "Unknown";
      const dayKey =
        row.day_key ||
        dayKeyByDate.get(String(row.registration_date || "").slice(0, 10)) ||
        "";
      if (!dayKey) return;
      if (!byState.has(state)) {
        byState.set(state, {});
      }
      const stateData = byState.get(state);
      if (!stateData[dayKey]) {
        stateData[dayKey] = { male: 0, female: 0 };
      }
      const gender = (row.gender || "").toLowerCase();
      if (gender === "male") {
        stateData[dayKey].male += Number(row.total) || 0;
      } else if (gender === "female") {
        stateData[dayKey].female += Number(row.total) || 0;
      }
    });
    return Array.from(byState.entries()).map(([state, values]) => ({
      state,
      values,
    }));
  }, [zonalDailyData, states, zonalDailyFilters.state, dayKeyByDate]);

  const totals = useMemo(() => {
    const totalsByDay = {};
    days.forEach((day) => {
      totalsByDay[day.key] = { male: 0, female: 0 };
    });
    zonalDailyData.forEach((row) => {
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
  }, [days, zonalDailyData, dayKeyByDate]);

  const buildRows = () => {
    const headerRow = ["State"];
    days.forEach((day) => {
      headerRow.push(day.label, "", "");
    });
    headerRow.push("Grand Total");

    const subHeaderRow = [""];
    days.forEach(() => {
      subHeaderRow.push("F", "M", "T");
    });
    subHeaderRow.push("F", "M", "T");

    const rows = [headerRow, subHeaderRow];

    reportMatrix.forEach((row) => {
      let grandFemale = 0;
      let grandMale = 0;
      const line = [row.state];
      days.forEach((day) => {
        const male = row.values[day.key]?.male || 0;
        const female = row.values[day.key]?.female || 0;
        const total = male + female;
        grandFemale += female;
        grandMale += male;
        line.push(String(female), String(male), String(total));
      });
      line.push(String(grandFemale), String(grandMale), String(grandFemale + grandMale));
      rows.push(line);
    });

    const totalLine = ["Grand Total"];
    let totalFemale = 0;
    let totalMale = 0;
    days.forEach((day) => {
      const male = totals[day.key]?.male || 0;
      const female = totals[day.key]?.female || 0;
      totalFemale += female;
      totalMale += male;
      totalLine.push(String(female), String(male), String(female + male));
    });
    totalLine.push(String(totalFemale), String(totalMale), String(totalFemale + totalMale));
    rows.push(totalLine);

    return rows;
  };

  const downloadXlsx = () => {
    if (!reportMatrix.length) return;
    const rows = buildRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const start = zonalSettings?.start_date || "start";
    const end = zonalSettings?.end_date || "end";
    XLSX.writeFile(workbook, `zonal-daily-report-${start}-to-${end}.xlsx`);
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Zonal Congress Reports</p>
          <h2>Daily Registration by State</h2>
          <p className="lede">Summary by state and day.</p>
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
        <form onSubmit={loadZonalDailyReport} className="form">
          <div className="grid">
            <label>
              State
              <select
                value={zonalDailyFilters.state}
                onChange={(e) =>
                  setZonalDailyFilters({ ...zonalDailyFilters, state: e.target.value })
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
            <p className="small-text">Set zonal congress dates first.</p>
          ) : null}
        </form>
      </section>

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Results</h3>
            <p className="lede">
              {reportMatrix.length
                ? `${reportMatrix.length} states loaded.`
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
                  <th rowSpan="2">State</th>
                  {days.map((day) => (
                    <th key={day.key} colSpan="3">
                      {day.label}
                    </th>
                  ))}
                  <th colSpan="3">Grand Total</th>
                </tr>
                <tr>
                  {days.flatMap((day) => [
                    <th key={`${day.key}-f`}>F</th>,
                    <th key={`${day.key}-m`}>M</th>,
                    <th key={`${day.key}-t`}>T</th>,
                  ])}
                  <th>F</th>
                  <th>M</th>
                  <th>T</th>
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row) => {
                  let grandFemale = 0;
                  let grandMale = 0;
                  return (
                    <tr key={row.state}>
                      <td>{row.state}</td>
                      {days.flatMap((day) => {
                        const male = row.values[day.key]?.male || 0;
                        const female = row.values[day.key]?.female || 0;
                        const total = male + female;
                        grandFemale += female;
                        grandMale += male;
                        return [
                          <td key={`${row.state}-${day.key}-f`}>{female}</td>,
                          <td key={`${row.state}-${day.key}-m`}>{male}</td>,
                          <td key={`${row.state}-${day.key}-t`}>{total}</td>,
                        ];
                      })}
                      <td>{grandFemale}</td>
                      <td>{grandMale}</td>
                      <td>{grandFemale + grandMale}</td>
                    </tr>
                  );
                })}
                <tr className="report-total-row">
                  <td>Grand Total</td>
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
                  <td>{days.reduce((sum, day) => sum + (totals[day.key]?.female || 0), 0)}</td>
                  <td>{days.reduce((sum, day) => sum + (totals[day.key]?.male || 0), 0)}</td>
                  <td>
                    {days.reduce(
                      (sum, day) =>
                        sum + (totals[day.key]?.female || 0) + (totals[day.key]?.male || 0),
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
