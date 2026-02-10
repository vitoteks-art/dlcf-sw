import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import AdminLocations from "../components/admin/AdminLocations";
import AdminOrganization from "../components/admin/AdminOrganization";
import AdminRoles from "../components/admin/AdminRoles";
import AdminStatePosts from "../components/admin/AdminStatePosts";
import AdminCategories from "../components/admin/AdminCategories";
import AdminStateHome from "../components/admin/AdminStateHome";
import AdminStateCongress from "../components/admin/AdminStateCongress";
import AdminZonalCongress from "../components/admin/AdminZonalCongress";
import AdminMedia from "../components/admin/AdminMedia";
import AdminPublications from "../components/admin/AdminPublications";

export default function AdminPage(props) {
  const {
    user,
    canViewAdmin,
    canManageStates,
    canManageRegions,
    canManageFellowships,
    canManageInstitutions,
    canManageWorkUnits,
    canManageRoles,
    canManageUsers,
    canManageStatePosts,
    canManageCategories,
    canManageStateHome,
    canManageStateCongress,
    canManageZonalCongress,
    canPublishMedia,
    canManageMedia,
    canManagePublications,
    loadZonalCongressSettings,
    loadAdminStates,
    loadAdminWorkUnits,
    loadAdminRoles,
    loadAdminUsers,
    loadAdminRegions,
    loadAdminInstitutions,
    loadAdminFellowships,
    loadAdminStatePosts,
    loadAdminCategories,
    loadAdminStateHome,
    adminInstitutionState,
    adminStatePostState,
    adminStateHomeState,
  } = props;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (!canViewAdmin) {
      navigate("/");
      return;
    }
    if (canManageStates) loadAdminStates();
    if (canManageWorkUnits) loadAdminWorkUnits();
    if (canManageRoles || canManageUsers) loadAdminRoles();
    if (canManageUsers) loadAdminUsers();
    if (canManageCategories) loadAdminCategories();
  }, [
    user,
    canViewAdmin,
    canManageInstitutions,
    canManageRoles,
    canManageStates,
    canManageUsers,
    canManageWorkUnits,
    canManageCategories,
    canManageStateCongress,
    canManageZonalCongress,
    navigate
  ]);

  useEffect(() => {
    if (!canManageInstitutions || !adminInstitutionState) return;
    loadAdminInstitutions(adminInstitutionState);
  }, [canManageInstitutions, adminInstitutionState]);

  useEffect(() => {
    if (!canManageStatePosts || !adminStatePostState) return;
    loadAdminStatePosts(adminStatePostState);
  }, [canManageStatePosts, adminStatePostState]);

  useEffect(() => {
    if (!canManageStateHome || !adminStateHomeState) return;
    loadAdminStateHome(adminStateHomeState);
  }, [canManageStateHome, adminStateHomeState]);

  useEffect(() => {
    if (!canManageRegions || !props.adminRegionState) return;
    loadAdminRegions(props.adminRegionState);
  }, [canManageRegions, props.adminRegionState]);

  useEffect(() => {
    if (!canManageFellowships || !props.adminFellowshipState) return;
    loadAdminFellowships(props.adminFellowshipState);
  }, [canManageFellowships, props.adminFellowshipState]);

  if (!user) return null;

  const tabs = [
    { id: "overview", label: "Overview", show: true }, // Always show overview
    { id: "users", label: "Users", show: canManageUsers },
    { id: "locations", label: "Locations", show: canManageStates || canManageRegions || canManageFellowships },
    { id: "organization", label: "Organization", show: canManageInstitutions || canManageWorkUnits },
    { id: "roles", label: "Roles", show: canManageRoles },
    { id: "state-posts", label: "State Updates", show: canManageStatePosts },
    { id: "state-home", label: "State Home", show: canManageStateHome },
    { id: "state-congress", label: "State Congress", show: canManageStateCongress },
    { id: "zonal-congress", label: "Zonal Congress", show: canManageZonalCongress },
    { id: "media", label: "Media", show: canManageMedia || canPublishMedia },
    { id: "publications", label: "Publications", show: canManagePublications },
    { id: "categories", label: "Categories", show: canManageCategories },
  ].filter(t => t.show);

  // If active tab is not visible, redirect
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  return (
    <section className="card retreat-page admin-dashboard-page">
      <div className="retreat-head">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage users, locations, and access control.</p>
        </div>
        <div>
          <Link className="ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>

      <div className="admin-tabs-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content-area">
        {activeTab === "overview" && <AdminOverview {...props} />}
        {activeTab === "users" && <AdminUsers {...props} />}
        {activeTab === "locations" && <AdminLocations {...props} />}
        {activeTab === "organization" && <AdminOrganization {...props} />}
        {activeTab === "roles" && <AdminRoles {...props} />}
        {activeTab === "state-posts" && <AdminStatePosts {...props} />}
        {activeTab === "state-home" && <AdminStateHome {...props} />}
        {activeTab === "state-congress" && <AdminStateCongress {...props} />}
        {activeTab === "zonal-congress" && <AdminZonalCongress {...props} />}
        {activeTab === "media" && <AdminMedia {...props} />}
        {activeTab === "publications" && <AdminPublications {...props} />}
        {activeTab === "categories" && <AdminCategories {...props} />}
      </div>
    </section>
  );
}
