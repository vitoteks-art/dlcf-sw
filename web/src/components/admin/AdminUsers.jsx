import React, { useState } from "react";

export default function AdminUsers({
    // Data
    adminUsers,
    adminRoles,
    workUnitsList,
    stateOptions,

    // New User Form Data
    newUser,
    setNewUser,
    newUserRegions,
    newUserCentres,

    // Edit User Form Data
    editUserId,
    setEditUserId,
    editUser,
    setEditUser,
    editUserRegions,
    editUserCentres,

    // Handlers
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    toggleWorkUnit,
}) {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="admin-section">
            <div className="section-header">
                <h3>User Management</h3>
                <button
                    className="btn-primary-outline"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "Cancel Add" : "+ Add New User"}
                </button>
            </div>

            {showAddForm && (
                <div className="card form-card slide-in">
                    <h4>Add New User</h4>
                    <form onSubmit={handleAddUser} className="form compact-form">
                        <div className="grid-3">
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Password
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </label>
                        </div>

                        <div className="grid-3">
                            <label>
                                Role
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {adminRoles.map((role) => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                State
                                <select
                                    value={newUser.state}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            state: e.target.value,
                                            region: "",
                                            fellowship_centre: "",
                                        })
                                    }
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
                                    value={newUser.region}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            region: e.target.value,
                                            fellowship_centre: "",
                                        })
                                    }
                                    disabled={!newUser.state}
                                >
                                    <option value="">Select region</option>
                                    {newUserRegions.map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid-2">
                            <label>
                                Fellowship Centre
                                <select
                                    value={newUser.fellowship_centre}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, fellowship_centre: e.target.value })
                                    }
                                    disabled={!newUser.region}
                                >
                                    <option value="">Select centre</option>
                                    {newUserCentres.map((centre) => (
                                        <option key={centre} value={centre}>{centre}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Work Units
                                <div className="checkbox-grid small-text">
                                    {workUnitsList.map((unit) => (
                                        <label key={unit} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={newUser.work_units.includes(unit)}
                                                onChange={() => toggleWorkUnit(unit, setNewUser)}
                                            />
                                            <span>{unit}</span>
                                        </label>
                                    ))}
                                </div>
                            </label>
                        </div>

                        <button type="submit" className="btn-primary">Create User</button>
                    </form>
                </div>
            )}

            {editUserId && (
                <div className="card form-card slide-in" style={{ borderLeft: '4px solid #f57c00' }}>
                    <div className="flex-between">
                        <h4>Edit User</h4>
                        <button className="btn-text" onClick={() => setEditUserId("")}>Close</button>
                    </div>
                    <form onSubmit={handleEditUser} className="form compact-form">
                        <div className="grid-3">
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={editUser.name}
                                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Password (Optional)
                                <input
                                    type="password"
                                    value={editUser.password}
                                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                                    placeholder="Leave blank to keep current"
                                />
                            </label>
                        </div>
                        <div className="grid-3">
                            <label>
                                Role
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {adminRoles.map((role) => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                State
                                <select
                                    value={editUser.state}
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            state: e.target.value,
                                            region: "",
                                            fellowship_centre: "",
                                        })
                                    }
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
                                    value={editUser.region}
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            region: e.target.value,
                                            fellowship_centre: "",
                                        })
                                    }
                                    disabled={!editUser.state}
                                >
                                    <option value="">Select region</option>
                                    {editUserRegions.map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid-2">
                            <label>
                                Fellowship Centre
                                <select
                                    value={editUser.fellowship_centre}
                                    onChange={(e) =>
                                        setEditUser({ ...editUser, fellowship_centre: e.target.value })
                                    }
                                    disabled={!editUser.region}
                                >
                                    <option value="">Select centre</option>
                                    {editUserCentres.map((centre) => (
                                        <option key={centre} value={centre}>{centre}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Work Units
                                <div className="checkbox-grid small-text">
                                    {workUnitsList.map((unit) => (
                                        <label key={unit} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={editUser.work_units.includes(unit)}
                                                onChange={() => toggleWorkUnit(unit, setEditUser)}
                                            />
                                            <span>{unit}</span>
                                        </label>
                                    ))}
                                </div>
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-warning">Update User</button>
                            <button type="button" onClick={() => setEditUserId("")}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>State</th>
                            <th>Region</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminUsers.map((user) => (
                            <tr key={user.id} className={editUserId === String(user.id) ? "active-row" : ""}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className="role-badge">{user.role}</span></td>
                                <td>{user.state || "-"}</td>
                                <td>{user.region || "-"}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-sm btn-outline"
                                        onClick={() => setEditUserId(String(user.id))}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this user?')) {
                                                handleDeleteUser(user.id);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {adminUsers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
