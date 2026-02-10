import { useMemo } from "react";

export default function STMCPage({
  status,
  stmc,
  setStmc,
  stmcRegions,
  stmcInstitutions,
  submitStmc,
  stmcReportFilters,
  setStmcReportFilters,
  stmcReportData,
  loadStmcReport,
  states,
}) {
  const reportRows = useMemo(() => {
    const byState = new Map();
    stmcReportData.forEach((row) => {
      const state = row.state || "Unknown";
      if (!byState.has(state)) {
        byState.set(state, {
          level: { "100": 0, "200": 0, "300": 0 },
          gender: { male: 0, female: 0 },
        });
      }
      const entry = byState.get(state);
      if (entry.level[row.level] !== undefined) {
        entry.level[row.level] += Number(row.total) || 0;
      }
      if (entry.gender[row.gender] !== undefined) {
        entry.gender[row.gender] += Number(row.total) || 0;
      }
    });
    return Array.from(byState.entries()).map(([state, values]) => ({
      state,
      ...values,
    }));
  }, [stmcReportData]);

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">STMC Registration</p>
          <h2>Student Training & Membership Class</h2>
          <p className="lede">
            Submit STMC registrations and review summaries by state.
          </p>
        </div>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Registration Form</h3>
            <p className="lede">
              Levels 200 and 300 require a matric number.
            </p>
          </div>
        </div>
        <form onSubmit={submitStmc} className="form">
          <div className="grid">
            <label>
              Level
              <select
                value={stmc.level}
                onChange={(e) =>
                  setStmc({ ...stmc, level: e.target.value })
                }
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
              </select>
            </label>
            <label>
              Gender
              <select
                value={stmc.gender}
                onChange={(e) =>
                  setStmc({ ...stmc, gender: e.target.value })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label>
              State
              <select
                value={stmc.state}
                onChange={(e) =>
                  setStmc({
                    ...stmc,
                    state: e.target.value,
                    region: "",
                    institution_name: "",
                  })
                }
                required
              >
                <option value="">Select state</option>
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
                value={stmc.region}
                onChange={(e) =>
                  setStmc({ ...stmc, region: e.target.value })
                }
                required
                disabled={!stmc.state}
              >
                <option value="">Select region</option>
                {stmcRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            {(stmc.level === "200" || stmc.level === "300") && (
              <label>
                Matric Number
                <input
                  type="text"
                  value={stmc.matric_number}
                  onChange={(e) =>
                    setStmc({ ...stmc, matric_number: e.target.value })
                  }
                  required
                />
              </label>
            )}
            <label>
              Institution
              <select
                value={stmc.institution_name}
                onChange={(e) =>
                  setStmc({ ...stmc, institution_name: e.target.value })
                }
                required
                disabled={!stmc.state || stmcInstitutions.length === 0}
              >
                <option value="">
                  {stmc.state
                    ? stmcInstitutions.length
                      ? "Select institution"
                      : "No institutions found"
                    : "Select state first"}
                </option>
                {stmcInstitutions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment Amount
              <input
                type="number"
                min="0"
                value={stmc.payment_amount}
                onChange={(e) =>
                  setStmc({ ...stmc, payment_amount: e.target.value })
                }
                required
              />
            </label>
          </div>
          <button type="submit">Submit Registration</button>
        </form>
      </section>

      <section className="card report-card">
        <div className="card-header">
          <div>
            <h3>Reports</h3>
            <p className="lede">Summary by state and level.</p>
          </div>
        </div>
        <form onSubmit={loadStmcReport} className="form">
          <div className="grid">
            <label>
              Start Date
              <input
                type="date"
                value={stmcReportFilters.start}
                onChange={(e) =>
                  setStmcReportFilters({
                    ...stmcReportFilters,
                    start: e.target.value,
                  })
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={stmcReportFilters.end}
                onChange={(e) =>
                  setStmcReportFilters({
                    ...stmcReportFilters,
                    end: e.target.value,
                  })
                }
              />
            </label>
            <label>
              State
              <select
                value={stmcReportFilters.state}
                onChange={(e) =>
                  setStmcReportFilters({
                    ...stmcReportFilters,
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

        <div className="report">
          {reportRows.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Level 100</th>
                  <th>Level 200</th>
                  <th>Level 300</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row) => {
                  const total =
                    row.gender.male + row.gender.female;
                  return (
                    <tr key={row.state}>
                      <td>{row.state}</td>
                      <td>{row.level["100"]}</td>
                      <td>{row.level["200"]}</td>
                      <td>{row.level["300"]}</td>
                      <td>{row.gender.male}</td>
                      <td>{row.gender.female}</td>
                      <td>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
