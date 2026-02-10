export default function AdminStateCongress({
  stateCongressSettings,
  setStateCongressSettings,
  saveStateCongressSettings,
  status,
}) {
  return (
    <section className="admin-overview">
      <h3>State Congress Dates</h3>
      <div className="card form-card">
        <form onSubmit={saveStateCongressSettings} className="form">
          <div className="grid">
            <label>
              Start Date
              <input
                type="date"
                value={stateCongressSettings.start_date || ""}
                onChange={(e) =>
                  setStateCongressSettings((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={stateCongressSettings.end_date || ""}
                onChange={(e) =>
                  setStateCongressSettings((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit">Save Dates</button>
          </div>
          {status ? <p className="small-text">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
