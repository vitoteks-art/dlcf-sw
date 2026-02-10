import React from "react";

export default function AdminOverview({
    adminUsers = [],
    adminStates = [],
    adminRegions = [],
    adminFellowships = [],
    adminInstitutions = [],
    adminWorkUnits = [],
    adminRoles = [],
}) {
    const stats = [
        { label: "Total Users", value: adminUsers.length, color: "var(--accent-2)" },
        { label: "States", value: adminStates.length, color: "#2E7D32" },
        { label: "Regions", value: adminRegions.length, color: "#1565C0" },
        { label: "Fellowships", value: adminFellowships.length, color: "#f57c00" },
        { label: "Institutions", value: adminInstitutions.length, color: "#7b1fa2" },
        { label: "Work Units", value: adminWorkUnits.length, color: "#616161" },
    ];

    return (
        <div className="admin-overview">
            <h3>Overview</h3>
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="admin-quick-actions">
                <h4>Recent Users</h4>
                <div className="compact-list">
                    {adminUsers.slice(0, 5).map(user => (
                        <div key={user.id} className="compact-list-item">
                            <span>{user.name}</span>
                            <span className="role-badge">{user.role}</span>
                        </div>
                    ))}
                    {adminUsers.length === 0 && <p className="empty-text">No users found.</p>}
                </div>
            </div>
        </div>
    );
}
