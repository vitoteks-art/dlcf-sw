import { useMemo } from "react";

export default function AdminAttendanceCodes({
  user,
  status,
  states,
  adminAttendanceCodes,
  adminAttendanceCodeForm,
  setAdminAttendanceCodeForm,
  adminAttendanceCodeRegions,
  adminAttendanceCodeCentres,
  adminAttendanceCodeResult,
  loadAdminAttendanceCodes,
  handleGenerateAttendanceCode,
  handleRevokeAttendanceCode,
}) {
  const isAssociate = user?.role === "associate_cord";
  const isGlobalScopeRole = ["administrator", "zonal_cord", "zonal_admin"].includes(user?.role);
  const isRegionScopeRole = ["region_cord", "region_admin"].includes(user?.role);
  const visibleCodes = useMemo(() => adminAttendanceCodes || [], [adminAttendanceCodes]);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Attendance Codes</h3>
        <p>Create and revoke attendance access codes.</p>
      </div>

      <div className="panel-content">
        <div className="form-card card">
          <h4>Generate Attendance Code</h4>
          <form onSubmit={handleGenerateAttendanceCode} className="form compact-form">
            <div className="grid-2">
              <label>
                State
                {isGlobalScopeRole ? (
                  <select
                    value={adminAttendanceCodeForm.state}
                    onChange={(e) =>
                      setAdminAttendanceCodeForm((prev) => ({
                        ...prev,
                        state: e.target.value,
                        region: "",
                        fellowship_centre_id: "",
                      }))
                    }
                    required
                  >
                    <option value="">Select state</option>
                    {(states || []).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={adminAttendanceCodeForm.state} disabled />
                )}
              </label>
              <label>
                Region
                <select
                  value={adminAttendanceCodeForm.region}
                  onChange={(e) =>
                    setAdminAttendanceCodeForm((prev) => ({
                      ...prev,
                      region: e.target.value,
                      fellowship_centre_id: "",
                    }))
                  }
                  disabled={isAssociate || isRegionScopeRole || !adminAttendanceCodeRegions.length}
                  required={!isAssociate}
                >
                  <option value="">Select region</option>
                  {adminAttendanceCodeRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fellowship Centre
                <select
                  value={adminAttendanceCodeForm.fellowship_centre_id}
                  onChange={(e) =>
                    setAdminAttendanceCodeForm((prev) => ({
                      ...prev,
                      fellowship_centre_id: e.target.value,
                    }))
                  }
                  required
                  disabled={!adminAttendanceCodeCentres.length}
                >
                  <option value="">Select centre</option>
                  {adminAttendanceCodeCentres.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Label (optional)
                <input
                  type="text"
                  value={adminAttendanceCodeForm.code_label}
                  onChange={(e) =>
                    setAdminAttendanceCodeForm((prev) => ({
                      ...prev,
                      code_label: e.target.value,
                    }))
                  }
                  placeholder="UI Central attendance code"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit">Generate Code</button>
              <button type="button" className="btn-outline" onClick={loadAdminAttendanceCodes}>
                Refresh List
              </button>
            </div>
          </form>

          {adminAttendanceCodeResult?.code ? (
            <div className="status success" style={{ marginTop: 16 }}>
              <strong>Code created successfully:</strong> {adminAttendanceCodeResult.code}
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Copy and share it now. It will not be shown in full again.
              </div>
            </div>
          ) : null}
        </div>

        <div className="table-container card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <h4>Existing Codes</h4>
          </div>
          {visibleCodes.length === 0 ? (
            <p>No attendance access codes created yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Fellowship Centre</th>
                  <th>State</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCodes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.code_label || "-"}</td>
                    <td>{item.fellowship_centre}</td>
                    <td>{item.state}</td>
                    <td>{item.region}</td>
                    <td>{item.status}</td>
                    <td>{item.created_by_name}</td>
                    <td>{item.created_at}</td>
                    <td>{item.last_used_at || "Never"}</td>
                    <td className="actions-cell">
                      {item.status === "active" ? (
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => handleRevokeAttendanceCode(item.id)}
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="small-text">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {status ? <div className="status">{status}</div> : null}
    </div>
  );
}
