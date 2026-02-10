import React from "react";

export default function AdminRoles({
    adminRoles,
    adminRoleName,
    setAdminRoleName,
    adminRoleEditId,
    setAdminRoleEditId,
    adminRoleEditName,
    setAdminRoleEditName,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
}) {
    const isEditing = !!adminRoleEditId;

    return (
        <div className="admin-section">
            <div className="section-header">
                <h3>Role Management</h3>
            </div>

            <div className="panel-content">
                <div className="form-card card">
                    <h4>{isEditing ? "Edit Role" : "Add New Role"}</h4>
                    <form onSubmit={isEditing ? handleEditRole : handleAddRole} className="form compact-form">
                        <label>
                            Role Name
                            <input
                                type="text"
                                value={isEditing ? adminRoleEditName : adminRoleName}
                                onChange={(e) => isEditing ? setAdminRoleEditName(e.target.value) : setAdminRoleName(e.target.value)}
                                required
                            />
                        </label>
                        <div className="form-actions">
                            <button type="submit">{isEditing ? "Update" : "Add"}</button>
                            {isEditing && <button type="button" onClick={() => setAdminRoleEditId("")}>Cancel</button>}
                        </div>
                    </form>
                </div>

                <div className="table-container card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminRoles.map(role => (
                                <tr key={role.id} className={String(role.id) === String(adminRoleEditId) ? 'active-row' : ''}>
                                    <td>{role.name}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-sm btn-outline"
                                            onClick={() => {
                                                setAdminRoleEditId(String(role.id));
                                                setAdminRoleEditName(role.name);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-sm btn-danger"
                                            onClick={() => handleDeleteRole(role.id)}
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
        </div>
    );
}
