import React, { useState } from "react";
import * as XLSX from "xlsx";
import { apiFetch } from "../../api";

export default function AdminLocations(props) {
    const [activeTab, setActiveTab] = useState("states");

    const tabs = [
        { id: "states", label: "States", show: props.canManageStates },
        { id: "regions", label: "Regions", show: props.canManageRegions },
        { id: "fellowships", label: "Fellowships", show: props.canManageFellowships },
    ].filter((t) => t.show);

    // If active tab is not visible, switch to first visible
    if (tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h3>Locations Management</h3>
            </div>

            <div className="sub-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`sub-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="sub-tab-content">
                {activeTab === "states" && (
                    <StatesPanel {...props} />
                )}
                {activeTab === "regions" && (
                    <RegionsPanel {...props} />
                )}
                {activeTab === "fellowships" && (
                    <FellowshipsPanel {...props} />
                )}
            </div>
        </div>
    );
}

function StatesPanel({
    adminStates,
    adminStateName,
    setAdminStateName,
    adminStateEditId,
    setAdminStateEditId,
    adminStateEditName,
    setAdminStateEditName,
    handleAddState,
    handleEditState,
    handleDeleteState,
}) {
    return (
        <div className="panel-content">
            <div className="form-card card">
                <h4>{adminStateEditId ? "Edit State" : "Add New State"}</h4>
                <form onSubmit={adminStateEditId ? handleEditState : handleAddState} className="form compact-form">
                    <label>
                        State Name
                        <input
                            type="text"
                            value={adminStateEditId ? adminStateEditName : adminStateName}
                            onChange={(e) => adminStateEditId ? setAdminStateEditName(e.target.value) : setAdminStateName(e.target.value)}
                            required
                        />
                    </label>
                    <div className="form-actions">
                        <button type="submit">{adminStateEditId ? "Update" : "Add"}</button>
                        {adminStateEditId && <button type="button" onClick={() => setAdminStateEditId("")}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>State Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminStates.map(state => (
                            <tr key={state.id} className={String(state.id) === String(adminStateEditId) ? 'active-row' : ''}>
                                <td>{state.name}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => {
                                            setAdminStateEditId(String(state.id));
                                            setAdminStateEditName(state.name);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => handleDeleteState(state.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RegionsPanel({
    adminRegions,
    adminRegionState,
    setAdminRegionState,
    stateOptions,
    adminRegionName,
    setAdminRegionName,
    adminRegionEditId,
    setAdminRegionEditId,
    adminRegionEditName,
    setAdminRegionEditName,
    adminRegionEditState,
    setAdminRegionEditState,
    handleAddRegion,
    handleEditRegion,
    handleDeleteRegion,
}) {
    const isEditing = !!adminRegionEditId;
    return (
        <div className="panel-content">
            <div className="form-card card">
                <h4>{isEditing ? "Edit Region" : "Add New Region"}</h4>
                <form onSubmit={isEditing ? handleEditRegion : handleAddRegion} className="form compact-form">
                    <div className="grid-2">
                        <label>
                            State
                            <select
                                value={isEditing ? (adminRegionEditState || adminRegionState) : adminRegionState}
                                onChange={(e) => isEditing ? setAdminRegionEditState(e.target.value) : setAdminRegionState(e.target.value)}
                                required
                            >
                                <option value="">Select state</option>
                                {stateOptions.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Region Name
                            <input
                                type="text"
                                value={isEditing ? adminRegionEditName : adminRegionName}
                                onChange={(e) => isEditing ? setAdminRegionEditName(e.target.value) : setAdminRegionName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="submit">{isEditing ? "Update" : "Add"}</button>
                        {isEditing && <button type="button" onClick={() => setAdminRegionEditId("")}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Region Name</th>
                            <th>State</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminRegions.map(region => (
                            <tr key={region.id} className={String(region.id) === String(adminRegionEditId) ? 'active-row' : ''}>
                                <td>{region.name}</td>
                                <td>{region.state_name}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => {
                                            setAdminRegionEditId(String(region.id));
                                            setAdminRegionEditName(region.name);
                                            setAdminRegionEditState(region.state_name);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => handleDeleteRegion(region.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FellowshipsPanel({
    adminFellowships,
    adminFellowshipState,
    setAdminFellowshipState,
    adminFellowshipRegion,
    setAdminFellowshipRegion,
    adminFellowshipName,
    setAdminFellowshipName,
    adminFellowshipEditId,
    setAdminFellowshipEditId,
    adminFellowshipEditName,
    setAdminFellowshipEditName,
    adminFellowshipEditState,
    setAdminFellowshipEditState,
    adminFellowshipEditRegion,
    setAdminFellowshipEditRegion,
    stateOptions,
    adminFellowshipRegions,
    adminFellowshipEditRegions,
    handleAddFellowship,
    handleEditFellowship,
    handleDeleteFellowship,
    loadAdminFellowships
}) {
    const isEditing = !!adminFellowshipEditId;
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploadErrors, setUploadErrors] = useState([]);

    const extractField = (row, field) => {
        const key = Object.keys(row).find(
            (k) => k.toLowerCase().trim() === field
        );
        return key ? String(row[key]).trim() : "";
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!uploadFile) {
            setUploadStatus("Select an Excel (.xlsx) file to upload.");
            return;
        }
        setUploading(true);
        setUploadStatus("");
        setUploadErrors([]);

        try {
            const data = await uploadFile.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            const items = rows
                .map((row) => ({
                    name: extractField(row, "name"),
                    state: extractField(row, "state"),
                    region: extractField(row, "region"),
                }))
                .filter((row) => row.name || row.state || row.region);

            if (items.length === 0) {
                setUploadStatus("No rows found. Ensure columns are name, state, region.");
                setUploading(false);
                return;
            }

            const response = await apiFetch("/admin/fellowships/bulk", {
                method: "POST",
                body: JSON.stringify({ items }),
            });
            setUploadStatus(
                `Uploaded. Inserted ${response.inserted || 0}, skipped ${response.skipped || 0}.`
            );
            setUploadErrors(response.errors || []);
            if (adminFellowshipState && adminFellowshipRegion) {
                loadAdminFellowships(adminFellowshipState, adminFellowshipRegion);
            }
        } catch (err) {
            setUploadStatus(err.message);
        } finally {
            setUploading(false);
            setUploadFile(null);
        }
    };

    return (
        <div className="panel-content">
            <div className="form-card card">
                <h4>Upload Fellowship List (.xlsx)</h4>
                <form onSubmit={handleUpload} className="form compact-form">
                    <div className="grid-2">
                        <label>
                            Excel File
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            />
                        </label>
                        <label>
                            Required Columns
                            <input type="text" value="name, state, region" disabled />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload Fellowships"}
                        </button>
                    </div>
                    {uploadStatus ? <p className="small-text">{uploadStatus}</p> : null}
                    {uploadErrors.length > 0 ? (
                        <div className="small-text">
                            {uploadErrors.slice(0, 5).map((item, idx) => (
                                <p key={`${item.row}-${idx}`}>{item.message}</p>
                            ))}
                            {uploadErrors.length > 5 ? (
                                <p>+{uploadErrors.length - 5} more errors</p>
                            ) : null}
                        </div>
                    ) : null}
                </form>
            </div>
            <div className="form-card card">
                <h4>{isEditing ? "Edit Fellowship" : "Add New Fellowship"}</h4>
                <form onSubmit={isEditing ? handleEditFellowship : handleAddFellowship} className="form compact-form">
                    <div className="grid-3">
                        <label>
                            State
                            <select
                                value={isEditing ? (adminFellowshipEditState || adminFellowshipState) : adminFellowshipState}
                                onChange={(e) => {
                                    if (isEditing) {
                                        setAdminFellowshipEditState(e.target.value);
                                        setAdminFellowshipEditRegion("");
                                    } else {
                                        setAdminFellowshipState(e.target.value);
                                        setAdminFellowshipRegion("");
                                    }
                                }}
                                required
                            >
                                <option value="">Select state</option>
                                {stateOptions.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Region
                            <select
                                value={isEditing ? (adminFellowshipEditRegion || "") : adminFellowshipRegion}
                                onChange={(e) => isEditing ? setAdminFellowshipEditRegion(e.target.value) : setAdminFellowshipRegion(e.target.value)}
                                required
                                disabled={isEditing ? !adminFellowshipEditState : !adminFellowshipState}
                            >
                                <option value="">Select region</option>
                                {(isEditing ? adminFellowshipEditRegions : adminFellowshipRegions).map((region) => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Fellowship Name
                            <input
                                type="text"
                                value={isEditing ? adminFellowshipEditName : adminFellowshipName}
                                onChange={(e) => isEditing ? setAdminFellowshipEditName(e.target.value) : setAdminFellowshipName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="submit">{isEditing ? "Update" : "Add"}</button>
                        {isEditing && <button type="button" onClick={() => setAdminFellowshipEditId("")}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fellowship Name</th>
                            <th>State</th>
                            <th>Region</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminFellowships.map(centre => (
                            <tr key={centre.id} className={String(centre.id) === String(adminFellowshipEditId) ? 'active-row' : ''}>
                                <td>{centre.name}</td>
                                <td>{centre.state}</td>
                                <td>{centre.region}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => {
                                            setAdminFellowshipEditId(String(centre.id));
                                            setAdminFellowshipEditName(centre.name);
                                            setAdminFellowshipEditState(centre.state);
                                            setAdminFellowshipEditRegion(centre.region);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => handleDeleteFellowship(centre.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
