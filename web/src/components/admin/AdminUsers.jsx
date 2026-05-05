import React, { useMemo, useState } from "react";
import SearchableSelect from "./SearchableSelect";

export default function AdminUsers({
    user,
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
    const [userSearch, setUserSearch] = useState("");
    const isStateScopedAdmin = user && ["state_cord", "state_admin"].includes(user.role);
    const isRegionScopedAdmin = user && ["region_cord", "region_admin", "associate_cord"].includes(user.role);
    const isScopedAdmin = isStateScopedAdmin || isRegionScopedAdmin;
    const visibleStateOptions = isScopedAdmin ? (user?.state ? [user.state] : []) : stateOptions;
    const filteredAdminUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return adminUsers;
        return adminUsers.filter((item) => {
            const haystack = [
                item.name,
                item.email,
                item.phone,
                item.phone_number,
                item.mobile,
                item.role,
                item.state,
                item.region,
                item.fellowship_centre,
            ].join(" ").toLowerCase();
            return haystack.includes(q);
        });
    }, [adminUsers, userSearch]);

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
                            <SearchableSelect
                                label="State"
                                value={newUser.state}
                                onChange={(value) =>
                                    setNewUser({
                                        ...newUser,
                                        state: isScopedAdmin ? (user?.state || "") : value,
                                        region: "",
                                        fellowship_centre: "",
                                    })
                                }
                                options={visibleStateOptions}
                                placeholder="Type to search state"
                                disabled={!!isScopedAdmin}
                            />
                            <SearchableSelect
                                label="Region"
                                value={newUser.region}
                                onChange={(value) =>
                                    setNewUser({
                                        ...newUser,
                                        region: value,
                                        fellowship_centre: "",
                                    })
                                }
                                options={newUserRegions}
                                placeholder="Type to search region"
                                disabled={!newUser.state}
                            />
                        </div>

                        <div className="grid-2">
                            <SearchableSelect
                                label="Fellowship Centre"
                                value={newUser.fellowship_centre}
                                onChange={(value) => setNewUser({ ...newUser, fellowship_centre: value })}
                                options={newUserCentres}
                                placeholder="Type to search centre"
                                disabled={!newUser.region}
                            />
                            <label>
                                Work Units
                                <div className="checkbox-grid small-text">
                                    {(isStateScopedAdmin ? [] : workUnitsList).map((unit) => (
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
                            <SearchableSelect
                                label="State"
                                value={editUser.state}
                                onChange={(value) =>
                                    setEditUser({
                                        ...editUser,
                                        state: isScopedAdmin ? (user?.state || "") : value,
                                        region: "",
                                        fellowship_centre: "",
                                    })
                                }
                                options={visibleStateOptions}
                                placeholder="Type to search state"
                                disabled={!!isScopedAdmin}
                            />
                            <SearchableSelect
                                label="Region"
                                value={editUser.region}
                                onChange={(value) =>
                                    setEditUser({
                                        ...editUser,
                                        region: value,
                                        fellowship_centre: "",
                                    })
                                }
                                options={editUserRegions}
                                placeholder="Type to search region"
                                disabled={!editUser.state}
                            />
                        </div>

                        <div className="grid-2">
                            <SearchableSelect
                                label="Fellowship Centre"
                                value={editUser.fellowship_centre}
                                onChange={(value) => setEditUser({ ...editUser, fellowship_centre: value })}
                                options={editUserCentres}
                                placeholder="Type to search centre"
                                disabled={!editUser.region}
                            />
                            <label>
                                Work Units
                                <div className="checkbox-grid small-text">
                                    {(isStateScopedAdmin ? [] : workUnitsList).map((unit) => (
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
                <div className="admin-list-toolbar">
                    <div>
                        <h4>Users</h4>
                        <p className="small-text">Showing {filteredAdminUsers.length} of {adminUsers.length} users</p>
                    </div>
                    <div className="admin-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users by name, email, or phone..."
                        />
                        {userSearch ? <button type="button" onClick={() => setUserSearch("")}>Clear</button> : null}
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>State</th>
                            <th>Region</th>
                            <th>Fellowship</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdminUsers.map((user) => (
                            <tr key={user.id} className={editUserId === String(user.id) ? "active-row" : ""}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || user.phone_number || user.mobile || "-"}</td>
                                <td><span className="role-badge">{user.role}</span></td>
                                <td>{user.state || "-"}</td>
                                <td>{user.region || "-"}</td>
                                <td>{user.fellowship_centre || "-"}</td>
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
                        {filteredAdminUsers.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
