import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AttendanceReportPage({
  user,
  status,
  report,
  setReport,
  reportRegions,
  reportCentres,
  loadReport,
  reportData,
  states,
}) {
  const navigate = useNavigate();

  const serviceDayGroups = useMemo(
    () => [
      { key: "thursday_rh", label: "TRETS" },
      { key: "sunday_ws", label: "SWS" },
      { key: "monday_bs", label: "MBS" },
      { key: "sunday_koinonia", label: "HCF" },
    ],
    []
  );

  const categories = useMemo(() => ["adult", "youth", "children"], []);
  const genders = useMemo(() => ["male", "female"], []);

  const reportMatrix = useMemo(() => {
    const byCentre = new Map();
    reportData.forEach((row) => {
      const centre = row.fellowship_centre || "Unknown Centre";
      if (!byCentre.has(centre)) {
        byCentre.set(centre, {});
      }
      const centreData = byCentre.get(centre);
      const serviceDay = row.service_day || "unknown";
      if (!centreData[serviceDay]) {
        centreData[serviceDay] = {
          metrics: {
            visitors: 0,
            converts: 0,
            tithe_and_offering: 0,
          },
        };
      }
      const key = `${row.category || ""}:${row.gender || ""}`;
      centreData[serviceDay][key] = Number(row.total) || 0;
      centreData[serviceDay].metrics = {
        visitors: Number(row.visitors) || 0,
        converts: Number(row.converts) || 0,
        tithe_and_offering: Number(row.tithe_and_offering) || 0,
      };
    });
    return Array.from(byCentre.entries()).map(([centre, values]) => ({
      centre,
      values,
    }));
  }, [reportData]);

  const totalsByService = useMemo(() => {
    const totals = {};
    serviceDayGroups.forEach((group) => {
      totals[group.key] = {};
      categories.forEach((category) => {
        genders.forEach((gender) => {
          totals[group.key][`${category}:${gender}`] = 0;
        });
      });
      totals[group.key].visitors = 0;
      totals[group.key].converts = 0;
      totals[group.key].tithe_and_offering = 0;
    });
    reportData.forEach((row) => {
      const serviceDay = row.service_day || "unknown";
      const key = `${row.category || ""}:${row.gender || ""}`;
      if (totals[serviceDay] && totals[serviceDay][key] !== undefined) {
        totals[serviceDay][key] += Number(row.total) || 0;
      }
      if (totals[serviceDay]) {
        totals[serviceDay].visitors += Number(row.visitors) || 0;
        totals[serviceDay].converts += Number(row.converts) || 0;
        totals[serviceDay].tithe_and_offering += Number(row.tithe_and_offering) || 0;
      }
    });
    return totals;
  }, [reportData, serviceDayGroups, categories, genders]);

  const buildWorksheetData = () => {
    const monthLabel = report.start
      ? new Date(report.start).toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()
      : "";
    const weekLabel = report.start && report.end ? `${report.start} to ${report.end}` : "";

    const rows = [];
    rows.push(["DEEPER LIFE CAMPUS FELLOWSHIP"]);
    rows.push(["WEEKLY ATTENDANCE REPORT"]);
    rows.push(["GROUP NAME", report.state || "DLCF"]);
    rows.push(["GROUP COORDINATOR", ""]);
    rows.push(["MONTH", monthLabel]);
    rows.push(["WEEK", weekLabel]);
    rows.push([]);

    const headerRow1 = ["S/N", "DISTRICT"];
    const headerRow2 = ["", ""];
    const headerRow3 = ["", ""];

    serviceDayGroups.forEach((group) => {
      headerRow1.push(group.label, "", "", "", "", "", "");
      headerRow2.push("Adult", "", "Student", "", "Children", "", "TOTAL");
      headerRow3.push("M", "F", "M", "F", "M", "F", "");
    });

    rows.push(headerRow1, headerRow2, headerRow3);

    const dataRows = reportMatrix.map((row, index) => {
      const cells = [index + 1, row.centre];
      serviceDayGroups.forEach((group) => {
        let serviceTotal = 0;
        categories.forEach((category) => {
          genders.forEach((gender) => {
            const key = `${category}:${gender}`;
            const value = row.values[group.key]?.[key] || 0;
            serviceTotal += value;
            cells.push(value);
          });
        });
        cells.push(serviceTotal);
      });
      return cells;
    });

    const totalsRow = ["", "TOTAL"];
    serviceDayGroups.forEach((group) => {
      let serviceTotal = 0;
      categories.forEach((category) => {
        genders.forEach((gender) => {
          const key = `${category}:${gender}`;
          const value = totalsByService[group.key]?.[key] || 0;
          serviceTotal += value;
          totalsRow.push(value);
        });
      });
      totalsRow.push(serviceTotal);
    });

    rows.push(...dataRows, totalsRow);
    return rows;
  };

  const handleDownload = () => {
    if (!reportMatrix.length) {
      return;
    }
    const data = buildWorksheetData();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 29 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 29 } },
    ];
    let startCol = 2;
    serviceDayGroups.forEach(() => {
      worksheet["!merges"].push(
        { s: { r: 7, c: startCol }, e: { r: 7, c: startCol + 6 } },
        { s: { r: 8, c: startCol }, e: { r: 8, c: startCol + 1 } },
        { s: { r: 8, c: startCol + 2 }, e: { r: 8, c: startCol + 3 } },
        { s: { r: 8, c: startCol + 4 }, e: { r: 8, c: startCol + 5 } },
        { s: { r: 8, c: startCol + 6 }, e: { r: 9, c: startCol + 6 } },
        { s: { r: 7, c: 0 }, e: { r: 9, c: 0 } },
        { s: { r: 7, c: 1 }, e: { r: 9, c: 1 } }
      );
      startCol += 7;
    });
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 22 },
      ...Array(28).fill({ wch: 5 }),
    ];

    const setCellStyle = (address, style) => {
      if (!worksheet[address]) return;
      worksheet[address].s = {
        ...(worksheet[address].s || {}),
        ...style,
      };
    };

    const centerBoldStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };

    ["A1", "A2"].forEach((cell) => setCellStyle(cell, centerBoldStyle));
    ["A3", "A4", "A5", "A6", "A8", "B8"].forEach((cell) =>
      setCellStyle(cell, centerBoldStyle)
    );

    for (let col = 2; col <= 29; col += 1) {
      const colName = XLSX.utils.encode_col(col);
      setCellStyle(`${colName}8`, centerBoldStyle);
      setCellStyle(`${colName}9`, centerBoldStyle);
      setCellStyle(`${colName}10`, centerBoldStyle);
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Report");
    XLSX.writeFile(workbook, "weekly-attendance-report.xlsx", {
      bookType: "xlsx",
    });
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Attendance Reports</p>
          <h2>Weekly Attendance Report</h2>
          <p className="lede">Filter and review attendance submissions.</p>
        </div>
        <Link className="ghost" to="/portal">
          Back to Attendance
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Filters</h3>
            <p className="lede">Choose a date range and location.</p>
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
        <form onSubmit={loadReport} className="form">
          <div className="grid">
            <label>
              Start Date
              <input
                type="date"
                value={report.start}
                onChange={(e) =>
                  setReport({ ...report, start: e.target.value })
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={report.end}
                onChange={(e) => setReport({ ...report, end: e.target.value })}
              />
            </label>
            <label>
              State
              <select
                value={report.state}
                onChange={(e) =>
                  setReport({ ...report, state: e.target.value, region: "", fellowship_centre: "" })
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
                value={report.region}
                onChange={(e) =>
                  setReport({ ...report, region: e.target.value, fellowship_centre: "" })
                }
                disabled={!report.state}
              >
                <option value="">All</option>
                {reportRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fellowship Centre
              <select
                value={report.fellowship_centre}
                onChange={(e) =>
                  setReport({ ...report, fellowship_centre: e.target.value })
                }
                disabled={!report.region}
              >
                <option value="">All</option>
                {reportCentres.map((centre) => (
                  <option key={centre} value={centre}>
                    {centre}
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
        <div className="report">
          {reportMatrix.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table className="attendance-report-table">
              <thead>
                <tr>
                  <th rowSpan="3">S/N</th>
                  <th rowSpan="3">District</th>
                  {serviceDayGroups.map((group) => (
                    <th key={group.key} colSpan="10">
                      {group.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {serviceDayGroups.flatMap((group) => [
                    <th key={`${group.key}-adult`} colSpan="2">
                      Adult
                    </th>,
                    <th key={`${group.key}-youth`} colSpan="2">
                      Youth
                    </th>,
                    <th key={`${group.key}-children`} colSpan="2">
                      Children
                    </th>,
                    <th key={`${group.key}-total`} rowSpan="2">
                      Total
                    </th>,
                    <th key={`${group.key}-visitors`} rowSpan="2">
                      Visitors
                    </th>,
                    <th key={`${group.key}-converts`} rowSpan="2">
                      Converts
                    </th>,
                    <th key={`${group.key}-tithe`} rowSpan="2">
                      Tithe & Offering
                    </th>,
                  ])}
                </tr>
                <tr>
                  {serviceDayGroups.flatMap((group) => [
                    <th key={`${group.key}-adult-m`}>M</th>,
                    <th key={`${group.key}-adult-f`}>F</th>,
                    <th key={`${group.key}-youth-m`}>M</th>,
                    <th key={`${group.key}-youth-f`}>F</th>,
                    <th key={`${group.key}-children-m`}>M</th>,
                    <th key={`${group.key}-children-f`}>F</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {reportMatrix.map((row, idx) => (
                  <tr key={`${row.centre}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{row.centre}</td>
                    {serviceDayGroups.flatMap((group) => {
                      const adultMale = row.values[group.key]?.["adult:male"] || 0;
                      const adultFemale = row.values[group.key]?.["adult:female"] || 0;
                      const youthMale = row.values[group.key]?.["youth:male"] || 0;
                      const youthFemale = row.values[group.key]?.["youth:female"] || 0;
                      const childrenMale =
                        row.values[group.key]?.["children:male"] || 0;
                      const childrenFemale =
                        row.values[group.key]?.["children:female"] || 0;
                      const total =
                        adultMale +
                        adultFemale +
                        youthMale +
                        youthFemale +
                        childrenMale +
                        childrenFemale;
                      const visitors = row.values[group.key]?.metrics?.visitors || 0;
                      const converts = row.values[group.key]?.metrics?.converts || 0;
                      const titheAndOffering = row.values[group.key]?.metrics?.tithe_and_offering || 0;
                      return [
                        <td key={`${row.centre}-${group.key}-adult-m`}>
                          {adultMale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-adult-f`}>
                          {adultFemale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-youth-m`}>
                          {youthMale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-youth-f`}>
                          {youthFemale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-children-m`}>
                          {childrenMale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-children-f`}>
                          {childrenFemale}
                        </td>,
                        <td key={`${row.centre}-${group.key}-total`}>{total}</td>,
                        <td key={`${row.centre}-${group.key}-visitors`}>{visitors}</td>,
                        <td key={`${row.centre}-${group.key}-converts`}>{converts}</td>,
                        <td key={`${row.centre}-${group.key}-tithe`}>{titheAndOffering}</td>,
                      ];
                    })}
                  </tr>
                ))}
                <tr className="report-total-row">
                  <td />
                  <td>Total</td>
                  {serviceDayGroups.flatMap((group) => {
                    const adultMale =
                      totalsByService[group.key]?.["adult:male"] || 0;
                    const adultFemale =
                      totalsByService[group.key]?.["adult:female"] || 0;
                    const youthMale =
                      totalsByService[group.key]?.["youth:male"] || 0;
                    const youthFemale =
                      totalsByService[group.key]?.["youth:female"] || 0;
                    const childrenMale =
                      totalsByService[group.key]?.["children:male"] || 0;
                    const childrenFemale =
                      totalsByService[group.key]?.["children:female"] || 0;
                    const total =
                      adultMale +
                      adultFemale +
                      youthMale +
                      youthFemale +
                      childrenMale +
                      childrenFemale;
                    const visitors = totalsByService[group.key]?.visitors || 0;
                    const converts = totalsByService[group.key]?.converts || 0;
                    const titheAndOffering = totalsByService[group.key]?.tithe_and_offering || 0;
                    return [
                      <td key={`${group.key}-total-adult-m`}>{adultMale}</td>,
                      <td key={`${group.key}-total-adult-f`}>{adultFemale}</td>,
                      <td key={`${group.key}-total-youth-m`}>{youthMale}</td>,
                      <td key={`${group.key}-total-youth-f`}>{youthFemale}</td>,
                      <td key={`${group.key}-total-children-m`}>{childrenMale}</td>,
                      <td key={`${group.key}-total-children-f`}>{childrenFemale}</td>,
                      <td key={`${group.key}-total-sum`}>{total}</td>,
                      <td key={`${group.key}-total-visitors`}>{visitors}</td>,
                      <td key={`${group.key}-total-converts`}>{converts}</td>,
                      <td key={`${group.key}-total-tithe`}>{titheAndOffering}</td>,
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
