import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function AdminOrganization(props) {
    const [activeTab, setActiveTab] = useState("institutions");

    const tabs = [
        { id: "institutions", label: "Institutions", show: props.canManageInstitutions },
        { id: "workunits", label: "Work Units", show: props.canManageWorkUnits },
    ].filter((t) => t.show);

    if (tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h3>Organization Management</h3>
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
                {activeTab === "institutions" && <InstitutionsPanel {...props} />}
                {activeTab === "workunits" && <WorkUnitsPanel {...props} />}
            </div>
        </div>
    );
}

function InstitutionsPanel({
    adminInstitutions,
    adminInstitutionState,
    setAdminInstitutionState,
    adminInstitutionName,
    setAdminInstitutionName,
    adminInstitutionEditId,
    setAdminInstitutionEditId,
    adminInstitutionEditName,
    setAdminInstitutionEditName,
    adminInstitutionEditState,
    setAdminInstitutionEditState,
    handleAddInstitution,
    handleBulkInstitutionUpload,
    handleEditInstitution,
    handleDeleteInstitution,
    stateOptions
}) {
    const isEditing = !!adminInstitutionEditId;
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploadErrors, setUploadErrors] = useState([]);
    const [uploadPreviewCount, setUploadPreviewCount] = useState(0);

    const extractField = (row, field) => {
        const key = Object.keys(row).find((k) => k.toLowerCase().trim() === field);
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
                    state: extractField(row, "state"),
                    institution_name: extractField(row, "institution_name"),
                }))
                .filter((row) => row.state || row.institution_name);

            if (items.length === 0) {
                setUploadStatus("No rows found. Ensure columns are state and institution_name.");
                setUploadPreviewCount(0);
                return;
            }

            setUploadPreviewCount(items.length);
            const response = await handleBulkInstitutionUpload(items);
            setUploadStatus(`Import completed. Added ${response.inserted || 0}, skipped ${response.skipped || 0}.`);
            setUploadErrors(response.errors || []);
            setUploadFile(null);
        } catch (err) {
            setUploadStatus(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="panel-content">
            <div className="form-card card">
                <h4>Bulk Upload Institutions</h4>
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
                            <input type="text" value="state, institution_name" disabled />
                        </label>
                    </div>
                    <p className="small-text">Upload an Excel file with these columns: state, institution_name.</p>
                    <div className="small-text">
                        <p>Example:</p>
                        <p>Oyo State (Central), University of Ibadan</p>
                        <p>Lagos State, University of Lagos</p>
                    </div>
                    {uploadPreviewCount > 0 ? <p className="small-text">{uploadPreviewCount} rows detected.</p> : null}
                    <div className="form-actions">
                        <button type="submit" disabled={uploading || !uploadFile}>
                            {uploading ? "Importing institutions..." : "Upload and Import"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUploadFile(null);
                                setUploadStatus("");
                                setUploadErrors([]);
                                setUploadPreviewCount(0);
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    {uploadStatus ? <p className="small-text">{uploadStatus}</p> : null}
                    {uploadErrors.length > 0 ? (
                        <div className="small-text">
                            {uploadErrors.slice(0, 8).map((item, idx) => (
                                <p key={`${item.row}-${idx}`}>{item.message}</p>
                            ))}
                            {uploadErrors.length > 8 ? <p>+{uploadErrors.length - 8} more errors</p> : null}
                        </div>
                    ) : null}
                </form>
            </div>

            <div className="form-card card">
                <h4>{isEditing ? "Edit Institution" : "Add New Institution"}</h4>
                <form onSubmit={isEditing ? handleEditInstitution : handleAddInstitution} className="form compact-form">
                    <div className="grid-2">
                        <label>
                            State
                            <select
                                value={isEditing ? (adminInstitutionEditState || adminInstitutionState) : adminInstitutionState}
                                onChange={(e) => {
                                    if (isEditing) {
                                        setAdminInstitutionEditState(e.target.value);
                                    } else {
                                        setAdminInstitutionState(e.target.value);
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
                            Institution Name
                            <input
                                type="text"
                                value={isEditing ? adminInstitutionEditName : adminInstitutionName}
                                onChange={(e) => isEditing ? setAdminInstitutionEditName(e.target.value) : setAdminInstitutionName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={!isEditing && !adminInstitutionState}>
                            {isEditing ? "Update" : "Add"}
                        </button>
                        {isEditing && <button type="button" onClick={() => setAdminInstitutionEditId("")}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Institution Name</th>
                            <th>State</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminInstitutions.map(inst => (
                            <tr key={inst.id} className={String(inst.id) === String(adminInstitutionEditId) ? 'active-row' : ''}>
                                <td>{inst.name}</td>
                                <td>{inst.state_name}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => {
                                            setAdminInstitutionEditId(String(inst.id));
                                            setAdminInstitutionEditName(inst.name);
                                            setAdminInstitutionEditState(inst.state_name);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => handleDeleteInstitution(inst.id)}
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

function WorkUnitsPanel({
    adminWorkUnits,
    adminWorkUnitName,
    setAdminWorkUnitName,
    adminWorkUnitEditId,
    setAdminWorkUnitEditId,
    adminWorkUnitEditName,
    setAdminWorkUnitEditName,
    handleAddWorkUnit,
    handleEditWorkUnit,
    handleDeleteWorkUnit,
}) {
    const isEditing = !!adminWorkUnitEditId;
    return (
        <div className="panel-content">
            <div className="form-card card">
                <h4>{isEditing ? "Edit Work Unit" : "Add New Work Unit"}</h4>
                <form onSubmit={isEditing ? handleEditWorkUnit : handleAddWorkUnit} className="form compact-form">
                    <label>
                        Work Unit Name
                        <input
                            type="text"
                            value={isEditing ? adminWorkUnitEditName : adminWorkUnitName}
                            onChange={(e) => isEditing ? setAdminWorkUnitEditName(e.target.value) : setAdminWorkUnitName(e.target.value)}
                            required
                        />
                    </label>
                    <div className="form-actions">
                        <button type="submit">{isEditing ? "Update" : "Add"}</button>
                        {isEditing && <button type="button" onClick={() => setAdminWorkUnitEditId("")}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Work Unit Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminWorkUnits.map(unit => (
                            <tr key={unit.id} className={String(unit.id) === String(adminWorkUnitEditId) ? 'active-row' : ''}>
                                <td>{unit.name}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => {
                                            setAdminWorkUnitEditId(String(unit.id));
                                            setAdminWorkUnitEditName(unit.name);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => handleDeleteWorkUnit(unit.id)}
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
