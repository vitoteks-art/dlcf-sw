export default function AdminZonalCongress({
  zonalSettings,
  setZonalSettings,
  saveZonalCongressSettings,
  status,
}) {
  return (
    <section className="admin-overview">
      <h3>Zonal Congress Dates</h3>
      <div className="card form-card">
        <form onSubmit={saveZonalCongressSettings} className="form">
          <div className="grid">
            <label>
              Start Date
              <input
                type="date"
                value={zonalSettings.start_date || ""}
                onChange={(e) =>
                  setZonalSettings((prev) => ({
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
                value={zonalSettings.end_date || ""}
                onChange={(e) =>
                  setZonalSettings((prev) => ({
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
