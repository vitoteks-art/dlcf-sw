import React, { useState } from "react";

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
    handleEditInstitution,
    handleDeleteInstitution,
    stateOptions
}) {
    const isEditing = !!adminInstitutionEditId;
    return (
        <div className="panel-content">
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
