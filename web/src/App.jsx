
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PortalHome from "./pages/PortalHome";
import PublicHome from "./pages/PublicHome";
import StatesPage from "./pages/StatesPage";
import STMCPage from "./pages/STMCPage";
import ZonalCongressPage from "./pages/ZonalCongressPage";
import StateCongressPage from "./pages/StateCongressPage";
import StateCongressRegionReportPage from "./pages/StateCongressRegionReportPage";
import StateCongressCategoryReportPage from "./pages/StateCongressCategoryReportPage";
import StateCongressMembershipReportPage from "./pages/StateCongressMembershipReportPage";
import StateCongressInstitutionReportPage from "./pages/StateCongressInstitutionReportPage";
import StateCongressClusterReportPage from "./pages/StateCongressClusterReportPage";
import ZonalDailyReportPage from "./pages/ZonalDailyReportPage";
import ZonalMembershipReportPage from "./pages/ZonalMembershipReportPage";
import PublicMediaListPage from "./pages/PublicMediaListPage";
import PublicMediaDetailPage from "./pages/PublicMediaDetailPage";
import PublicationsDetailPage from "./pages/PublicationsDetailPage";
import GospelLibraryPage from "./pages/GospelLibraryPage";
import StateMediaListPage from "./pages/StateMediaListPage";
import StateMediaDetailPage from "./pages/StateMediaDetailPage";
import StatePublicationsListPage from "./pages/StatePublicationsListPage";
import StatePublicationsDetailPage from "./pages/StatePublicationsDetailPage";
import RetreatPage from "./pages/RetreatPage";
import RetreatReportPage from "./pages/RetreatReportPage";
import RetreatClusterReportPage from "./pages/RetreatClusterReportPage";
import RetreatCentreReportPage from "./pages/RetreatCentreReportPage";
import AttendanceReportPage from "./pages/AttendanceReportPage";
import GckPage from "./pages/GckPage";
import GckReportPage from "./pages/GckReportPage";
import BiodataPage from "./pages/BiodataPage";
import BiodataListPage from "./pages/BiodataListPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import BeliefsPage from "./pages/BeliefsPage";
import StateDetailPage from "./pages/StateDetailPage";
import StatePostPage from "./pages/StatePostPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import { apiFetch, ensureCsrf, API_BASE } from "./api";

const emptyCounts = {
  adult: { male: 0, female: 0 },
  youth: { male: 0, female: 0 },
  children: { male: 0, female: 0 },
};

const clusters = [
  "UI Cluster",
  "MOOR plantation cluster",
  "UI",
  "AGBOWO",
  "ABADINA",
  "UCH",
  "POLY",
  "APETE",
  "ELEYELE",
  "CORPERS/IBADAN CITY POLY",
  "TRIOSIS",
  "Others",
];

const defaultStateHomeContent = {
  hero: {
    title: "",
    subtitle: "",
    intro: "",
    ctaPrimary: "",
    ctaSecondary: "",
    backgroundImageUrl: "",
  },
  stats: {
    members: "",
    regions: "",
    centers: "",
    growth: "",
  },
  events: [{ title: "", date: "", time: "", type: "" }],
  gallery: [{ url: "", caption: "" }],
  contact: {
    address: "",
    email: "",
    phone: "",
  },
  sections: [{ title: "", content: "" }],
};

const reservedPublicSegments = new Set([
  "",
  "about",
  "beliefs",
  "states",
  "portal",
  "attendance-report",
  "gck",
  "gck-report",
  "stmc",
  "zonal-congress",
  "media",
  "publications",
  "retreat",
  "retreat-report",
  "state-congress-report",
  "zonal-congress-report",
  "profile",
  "biodata",
  "biodata-list",
  "admin",
  "events",
  "blog",
  "updates",
]);

const slugifyStateName = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [coverage, setCoverage] = useState([]);
  const [states, setStates] = useState([]);
  const [workUnitsList, setWorkUnitsList] = useState([]);
  const [allCentres, setAllCentres] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [retreatClusters, setRetreatClusters] = useState([]);
  const [retreatClusterRegions, setRetreatClusterRegions] = useState([]);
  const [retreatReportClusters, setRetreatReportClusters] = useState([]);
  const [stmcInstitutions, setStmcInstitutions] = useState([]);

  const [attendance, setAttendance] = useState({
    entry_date: "",
    state: "",
    region: "",
    fellowship_centre: "",
    service_day: "sunday_ws",
    counts: emptyCounts,
  });
  const [attendanceEntryId, setAttendanceEntryId] = useState("");
  const [attendanceEntryKey, setAttendanceEntryKey] = useState("");
  const [attendanceRegions, setAttendanceRegions] = useState([]);
  const [attendanceCentres, setAttendanceCentres] = useState([]);

  const [report, setReport] = useState({
    start: "",
    end: "",
    state: "",
    region: "",
  });
  const [reportRegions, setReportRegions] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [stmc, setStmc] = useState({
    level: "100",
    state: "",
    region: "",
    matric_number: "",
    institution_name: "",
    payment_amount: "",
    gender: "Male",
  });
  const [stmcRegions, setStmcRegions] = useState([]);
  const [stmcReportFilters, setStmcReportFilters] = useState({
    start: "",
    end: "",
    state: "",
  });
  const [stmcReportData, setStmcReportData] = useState([]);

  const [gckReport, setGckReport] = useState({
    report_month: "",
    state: "",
    region: "",
    fellowship_centre: "",
    sessions: [],
  });
  const [gckRegions, setGckRegions] = useState([]);
  const [gckCentres, setGckCentres] = useState([]);
  const [gckEntryId, setGckEntryId] = useState("");
  const [gckEntryKey, setGckEntryKey] = useState("");
  const [gckSummary, setGckSummary] = useState([]);
  const [gckSummaryMeta, setGckSummaryMeta] = useState({
    group_name: "DLCF",
    coordinator_name: "",
    report_month: "",
    state: "",
  });
  const [gckSummaryFilters, setGckSummaryFilters] = useState({
    report_month: "",
    state: "",
    region: "",
  });
  const [gckSummaryRegions, setGckSummaryRegions] = useState([]);

  const [retreat, setRetreat] = useState({
    retreat_type: "easter",
    title: "Mr.",
    full_name: "",
    gender: "Male",
    email: "",
    phone: "",
    category: "Student",
    membership_status: "Member",
    cluster: "",
    dlcf_center: "",
    registration_date: "",
    state: "",
    region: "",
    fellowship_centre: "",
  });
  const [retreatEntryId, setRetreatEntryId] = useState("");
  const [retreatEntryKey, setRetreatEntryKey] = useState("");
  const [retreatRegions, setRetreatRegions] = useState([]);
  const [retreatCentres, setRetreatCentres] = useState([]);
  const [stateCongressSettings, setStateCongressSettings] = useState({
    start_date: "",
    end_date: "",
  });
  const [stateCongressReportFilters, setStateCongressReportFilters] = useState({
    state: "",
  });
  const [stateCongressReportData, setStateCongressReportData] = useState([]);
  const [stateCongressReportRegions, setStateCongressReportRegions] = useState([]);
  const [stateCongressCategoryFilters, setStateCongressCategoryFilters] = useState({
    state: "",
  });
  const [stateCongressCategoryData, setStateCongressCategoryData] = useState([]);
  const [stateCongressCategoryRegions, setStateCongressCategoryRegions] = useState([]);
  const [stateCongressMembershipFilters, setStateCongressMembershipFilters] = useState({
    state: "",
  });
  const [stateCongressMembershipData, setStateCongressMembershipData] = useState([]);
  const [stateCongressInstitutionFilters, setStateCongressInstitutionFilters] = useState({
    state: "",
  });
  const [stateCongressInstitutionData, setStateCongressInstitutionData] = useState([]);
  const [stateCongressClusterFilters, setStateCongressClusterFilters] = useState({
    state: "",
  });
  const [stateCongressClusterData, setStateCongressClusterData] = useState([]);
  const [zonalDailyFilters, setZonalDailyFilters] = useState({ state: "" });
  const [zonalDailyData, setZonalDailyData] = useState([]);
  const [zonalMembershipFilters, setZonalMembershipFilters] = useState({ state: "" });
  const [zonalMembershipData, setZonalMembershipData] = useState([]);
  const [stateCongressClusterReportClusters, setStateCongressClusterReportClusters] = useState([]);
  const [stateCongress, setStateCongress] = useState({
    title: "Mr.",
    full_name: "",
    gender: "Male",
    email: "",
    phone: "",
    category: "Student",
    membership_status: "Member",
    cluster: "",
    registration_date: "",
    state: "",
    region: "",
    fellowship_centre: "",
  });
  const [stateCongressEntryId, setStateCongressEntryId] = useState("");
  const [stateCongressEntryKey, setStateCongressEntryKey] = useState("");
  const [stateCongressRegions, setStateCongressRegions] = useState([]);
  const [stateCongressCentres, setStateCongressCentres] = useState([]);
  const [stateCongressClusters, setStateCongressClusters] = useState([]);
  const [retreatReport, setRetreatReport] = useState({
    start: "",
    end: "",
    retreat_type: "",
    cluster: "",
    dlcf_center: "",
    state: "",
    region: "",
  });
  const [retreatReportData, setRetreatReportData] = useState([]);
  const [retreatReportRegions, setRetreatReportRegions] = useState([]);
  const [retreatClusterFilters, setRetreatClusterFilters] = useState({
    retreat_type: "",
    state: "",
    region: "",
    day1: "",
    day2: "",
    day3: "",
    day4: "",
  });
  const [retreatClusterData, setRetreatClusterData] = useState([]);
  const [retreatCentreFilters, setRetreatCentreFilters] = useState({
    retreat_type: "",
    start: "",
    end: "",
    state: "",
    region: "",
  });
  const [retreatCentreData, setRetreatCentreData] = useState([]);
  const [retreatCentreRegions, setRetreatCentreRegions] = useState([]);

  const [zonalRegistration, setZonalRegistration] = useState({
    title: "Mr.",
    full_name: "",
    gender: "Male",
    email: "",
    phone: "",
    category: "Student",
    membership_status: "Member",
    registration_date: "",
    state: "",
    region: "",
    cluster: "",
    institution: "",
    fellowship_centre: "",
  });
  const [zonalEntryId, setZonalEntryId] = useState("");
  const [zonalEntryKey, setZonalEntryKey] = useState("");
  const [zonalRegions, setZonalRegions] = useState([]);
  const [zonalCentres, setZonalCentres] = useState([]);
  const [zonalClusters, setZonalClusters] = useState([]);
  const [zonalInstitutions, setZonalInstitutions] = useState([]);
  const [zonalSettings, setZonalSettings] = useState({
    start_date: "",
    end_date: "",
  });

  const [biodata, setBiodata] = useState({
    full_name: "",
    gender: "Male",
    age: "",
    phone: "",
    email: "",
    profile_photo: "",
    school: "",
    category: "",
    worker_status: "Member",
    membership_status: "Member",
    work_units: [],
    address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_relationship: "",
    state: "",
    region: "",
    cluster: "",
    fellowship_centre: "",
  });
  const [biodataEntryId, setBiodataEntryId] = useState("");
  const [biodataIsSelf, setBiodataIsSelf] = useState(false);
  const [biodataRegions, setBiodataRegions] = useState([]);
  const [biodataCentres, setBiodataCentres] = useState([]);
  const [biodataClusters, setBiodataClusters] = useState([]);
  const [biodataFilters, setBiodataFilters] = useState({
    state: "",
    region: "",
    fellowship_centre: "",
    search: "",
  });
  const [biodataFilterRegions, setBiodataFilterRegions] = useState([]);
  const [biodataFilterCentres, setBiodataFilterCentres] = useState([]);
  const [biodataData, setBiodataData] = useState([]);
  const [adminStates, setAdminStates] = useState([]);
  const [adminRegions, setAdminRegions] = useState([]);
  const [adminFellowships, setAdminFellowships] = useState([]);
  const [adminInstitutions, setAdminInstitutions] = useState([]);
  const [adminWorkUnits, setAdminWorkUnits] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStatePosts, setAdminStatePosts] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminCategoryName, setAdminCategoryName] = useState("");
  const [adminCategoryEditId, setAdminCategoryEditId] = useState("");
  const [adminCategoryEditName, setAdminCategoryEditName] = useState("");
  const [adminStateHomeState, setAdminStateHomeState] = useState("");
  const [adminStateHomeContent, setAdminStateHomeContent] = useState(null);
  const [adminStatePostState, setAdminStatePostState] = useState("");
  const [adminStatePostTitle, setAdminStatePostTitle] = useState("");
  const [adminStatePostType, setAdminStatePostType] = useState("");
  const [adminStatePostStatus, setAdminStatePostStatus] = useState("draft");
  const [adminStatePostPublishedAt, setAdminStatePostPublishedAt] = useState("");
  const [adminStatePostFeatureImage, setAdminStatePostFeatureImage] = useState("");
  const [adminStatePostContent, setAdminStatePostContent] = useState("");
  const [adminStatePostCategoryIds, setAdminStatePostCategoryIds] = useState([]);
  const [adminStatePostEditId, setAdminStatePostEditId] = useState("");
  const [adminStateName, setAdminStateName] = useState("");
  const [adminStateEditId, setAdminStateEditId] = useState("");
  const [adminStateEditName, setAdminStateEditName] = useState("");
  const [adminRegionState, setAdminRegionState] = useState("");
  const [adminRegionName, setAdminRegionName] = useState("");
  const [adminRegionEditId, setAdminRegionEditId] = useState("");
  const [adminRegionEditName, setAdminRegionEditName] = useState("");
  const [adminRegionEditState, setAdminRegionEditState] = useState("");
  const [adminFellowshipState, setAdminFellowshipState] = useState("");
  const [adminFellowshipRegion, setAdminFellowshipRegion] = useState("");
  const [adminFellowshipName, setAdminFellowshipName] = useState("");
  const [adminFellowshipRegions, setAdminFellowshipRegions] = useState([]);
  const [adminFellowshipEditId, setAdminFellowshipEditId] = useState("");
  const [adminFellowshipEditName, setAdminFellowshipEditName] = useState("");
  const [adminFellowshipEditState, setAdminFellowshipEditState] = useState("");
  const [adminFellowshipEditRegion, setAdminFellowshipEditRegion] = useState("");
  const [adminFellowshipEditRegions, setAdminFellowshipEditRegions] =
    useState([]);
  const [adminInstitutionState, setAdminInstitutionState] = useState("");
  const [adminInstitutionName, setAdminInstitutionName] = useState("");
  const [adminInstitutionEditId, setAdminInstitutionEditId] = useState("");
  const [adminInstitutionEditName, setAdminInstitutionEditName] = useState("");
  const [adminInstitutionEditState, setAdminInstitutionEditState] = useState("");
  const [adminWorkUnitName, setAdminWorkUnitName] = useState("");
  const [adminWorkUnitEditId, setAdminWorkUnitEditId] = useState("");
  const [adminWorkUnitEditName, setAdminWorkUnitEditName] = useState("");
  const [adminRoleName, setAdminRoleName] = useState("");
  const [adminRoleEditId, setAdminRoleEditId] = useState("");
  const [adminRoleEditName, setAdminRoleEditName] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    state: "",
    region: "",
    fellowship_centre: "",
    work_units: [],
  });
  const [newUserRegions, setNewUserRegions] = useState([]);
  const [newUserCentres, setNewUserCentres] = useState([]);
  const [editUserId, setEditUserId] = useState("");
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    state: "",
    region: "",
    fellowship_centre: "",
    work_units: [],
  });
  const [editUserRegions, setEditUserRegions] = useState([]);
  const [editUserCentres, setEditUserCentres] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const stateSlugs = useMemo(() => {
    const items = (states || [])
      .map((state) => {
        if (typeof state === "string") return slugifyStateName(state);
        if (state?.slug) return slugifyStateName(state.slug);
        if (state?.name) return slugifyStateName(state.name);
        return "";
      })
      .filter(Boolean);
    return new Set(items);
  }, [states]);
  const userWorkUnits = useMemo(() => {
    if (!user) return [];
    const raw = user.work_units;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [user]);
  const firstSegment = location.pathname.split("/").filter(Boolean)[0] || "";
  const isStatePath =
    stateSlugs.size > 0
      ? stateSlugs.has(firstSegment)
      : firstSegment !== "" && !reservedPublicSegments.has(firstSegment);
  const isPublicPage =
    ["/", "/about", "/beliefs", "/states", "/events", "/blog"].includes(location.pathname) ||
    location.pathname.startsWith("/states/") ||
    location.pathname.startsWith("/media") ||
    location.pathname.startsWith("/publications") ||
    isStatePath;

  const total = useMemo(() => {
    const c = attendance.counts;
    return (
      c.adult.male +
      c.adult.female +
      c.youth.male +
      c.youth.female +
      c.children.male +
      c.children.female
    );
  }, [attendance]);

  const buildAttendanceKey = (data) =>
    [
      data.entry_date,
      data.service_day,
      data.state,
      data.region,
      data.fellowship_centre,
    ].join("|");

  const buildRetreatKey = (data) =>
    [
      data.retreat_type,
      data.registration_date,
      data.email || "",
      data.phone || "",
    ].join("|");

  const buildStateCongressKey = (data) =>
    [data.registration_date, data.email || "", data.phone || ""].join("|");

  const buildGckKey = (data) =>
    [
      data.report_month,
      data.state,
      data.region,
      data.fellowship_centre,
    ].join("|");

  const buildZonalKey = (data) => [data.email || "", data.phone || ""].join("|");

  const stateSummaries = useMemo(
    () =>
      coverage.map((item) => ({
        name: item.state_name,
        regions: Number(item.regions_count || 0),
        centres: Number(item.centres_count || 0),
      })),
    [coverage]
  );
  const canManageStates = user && ["administrator", "zonal_cord", "zonal_admin"].includes(user.role);
  const canManageRegions =
    user && ["administrator", "zonal_cord", "zonal_admin", "state_cord", "state_admin"].includes(user.role);
  const canManageFellowships =
    user &&
    ["administrator", "zonal_cord", "zonal_admin", "state_cord", "state_admin", "region_cord", "associate_cord"].includes(
      user.role
    );
  const canManageInstitutions =
    user && ["administrator", "zonal_cord", "zonal_admin", "state_cord", "state_admin"].includes(user.role);
  const canManageWorkUnits = user && user.role === "administrator";
  const canManageRoles = user && user.role === "administrator";
  const canManageUsers =
    user &&
    [
      "administrator",
      "zonal_cord",
      "zonal_admin",
      "state_cord",
      "state_admin",
      "region_cord",
      "associate_cord",
    ].includes(user.role);
  const canPublishMedia =
    user &&
    [
      "administrator",
      "zonal_cord",
      "zonal_admin",
      "state_cord",
      "state_admin",
      "region_cord",
    ].includes(user.role);
  const canManageMedia =
    user &&
    (user.role === "administrator" ||
      userWorkUnits.includes("Gospel Production Team"));
  const canManagePublications =
    user &&
    (user.role === "administrator" ||
      userWorkUnits.includes("Publication Team"));
  const canManageStatePosts =
    user &&
    [
      "administrator",
      "zonal_cord",
      "zonal_admin",
      "state_cord",
      "state_admin",
    ].includes(user.role);
  const canManageCategories = canManageStatePosts;
  const canManageStateHome = canManageStatePosts;
  const canManageStateCongress = canManageStatePosts;
  const canManageZonalCongress = canManageStatePosts;
  const canManageBiodata =
    user &&
    ["administrator", "state_cord", "associate_cord", "region_cord"].includes(
      user.role
    );
  const canViewAdmin =
    canManageStates ||
    canManageRegions ||
    canManageFellowships ||
    canManageInstitutions ||
    canManageWorkUnits ||
    canManageRoles ||
    canManageUsers ||
    canManageMedia ||
    canManagePublications ||
    canPublishMedia;

  useEffect(() => {
    // Only check auth on portal/admin pages.
    // Public pages should NOT call /me (avoids 401 noise in console).
    const authPrefixes = [
      "/portal",
      "/gck",
      "/attendance-report",
      "/gck-report",
      "/stmc",
      "/zonal-congress",
      "/state-congress",
      "/state-congress-report",
      "/zonal-congress-report",
      "/retreat",
      "/retreat-report",
      "/profile",
      "/biodata",
      "/biodata-list",
      "/admin",
    ];

    const needsAuthCheck = authPrefixes.some(
      (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
    );

    const checkAuth = async (retries = 2) => {
      try {
        await ensureCsrf();
        const data = await apiFetch("/me");
        setUser(data.user);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => checkAuth(retries - 1), 1000);
        } else {
          // On protected routes, keep the user null and let LoginPage handle it.
          setUser(null);
        }
      }
    };

    if (needsAuthCheck) {
      checkAuth();
    }

    apiFetch("/meta/states")
      .then((data) => setStates(data.items || []))
      .catch(() => setStates([]));
    apiFetch("/meta/coverage")
      .then((data) => setCoverage(data.items || []))
      .catch(() => setCoverage([]));
    apiFetch("/meta/work-units")
      .then((data) => setWorkUnitsList(data.items || []))
      .catch(() => setWorkUnitsList([]));
    apiFetch("/meta/fellowships")
      .then((data) => setAllCentres(data.items || []))
      .catch(() => setAllCentres([]));
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    if (
      (user.role === "state_cord" || user.role === "state_admin") &&
      user.state &&
      !adminStatePostState
    ) {
      setAdminStatePostState(user.state);
    }
  }, [user, adminStatePostState]);

  useEffect(() => {
    if (!user) return;
    if (
      (user.role === "state_cord" || user.role === "state_admin") &&
      user.state &&
      !adminStateHomeState
    ) {
      setAdminStateHomeState(user.state);
    }
  }, [user, adminStateHomeState]);

  useEffect(() => {
    if (!attendance.state) {
      setAttendanceRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(attendance.state)}`)
      .then((data) => setAttendanceRegions(data.items || []))
      .catch(() => setAttendanceRegions([]));
  }, [attendance.state]);

  useEffect(() => {
    if (!attendance.state || !attendance.region) {
      setAttendanceCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        attendance.state
      )}&region=${encodeURIComponent(attendance.region)}`
    )
      .then((data) => setAttendanceCentres(data.items || []))
      .catch(() => setAttendanceCentres([]));
  }, [attendance.state, attendance.region]);

  useEffect(() => {
    const currentKey = buildAttendanceKey(attendance);
    if (attendanceEntryKey && currentKey !== attendanceEntryKey) {
      setAttendanceEntryId("");
      setAttendanceEntryKey("");
    }
  }, [
    attendance.entry_date,
    attendance.service_day,
    attendance.state,
    attendance.region,
    attendance.fellowship_centre,
    attendanceEntryKey,
  ]);

  useEffect(() => {
    const currentKey = buildRetreatKey(retreat);
    if (retreatEntryKey && currentKey !== retreatEntryKey) {
      setRetreatEntryId("");
      setRetreatEntryKey("");
    }
  }, [
    retreat.retreat_type,
    retreat.registration_date,
    retreat.email,
    retreat.phone,
    retreatEntryKey,
  ]);

  useEffect(() => {
    const currentKey = buildStateCongressKey(stateCongress);
    if (stateCongressEntryKey && currentKey !== stateCongressEntryKey) {
      setStateCongressEntryId("");
      setStateCongressEntryKey("");
    }
  }, [
    stateCongress.registration_date,
    stateCongress.email,
    stateCongress.phone,
    stateCongressEntryKey,
  ]);

  useEffect(() => {
    const currentKey = buildZonalKey(zonalRegistration);
    if (zonalEntryKey && currentKey !== zonalEntryKey) {
      setZonalEntryId("");
      setZonalEntryKey("");
    }
  }, [zonalRegistration.email, zonalRegistration.phone, zonalEntryKey]);

  useEffect(() => {
    const currentKey = buildGckKey(gckReport);
    if (gckEntryKey && currentKey !== gckEntryKey) {
      setGckEntryId("");
      setGckEntryKey("");
    }
  }, [
    gckReport.report_month,
    gckReport.state,
    gckReport.region,
    gckReport.fellowship_centre,
    gckEntryKey,
  ]);

  useEffect(() => {
    if (!report.state) {
      setReportRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(report.state)}`)
      .then((data) => setReportRegions(data.items || []))
      .catch(() => setReportRegions([]));
  }, [report.state]);

  useEffect(() => {
    if (!stmc.state) {
      setStmcRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(stmc.state)}`)
      .then((data) => setStmcRegions(data.items || []))
      .catch(() => setStmcRegions([]));
  }, [stmc.state]);

  useEffect(() => {
    if (!stmc.state) {
      setStmcInstitutions([]);
      return;
    }
    apiFetch(`/meta/institutions?state=${encodeURIComponent(stmc.state)}`)
      .then((data) => setStmcInstitutions(data.items || []))
      .catch(() => setStmcInstitutions([]));
  }, [stmc.state]);

  useEffect(() => {
    if (!gckReport.state) {
      setGckRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(gckReport.state)}`)
      .then((data) => setGckRegions(data.items || []))
      .catch(() => setGckRegions([]));
  }, [gckReport.state]);

  useEffect(() => {
    if (!gckReport.state || !gckReport.region) {
      setGckCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        gckReport.state
      )}&region=${encodeURIComponent(gckReport.region)}`
    )
      .then((data) => setGckCentres(data.items || []))
      .catch(() => setGckCentres([]));
  }, [gckReport.state, gckReport.region]);

  useEffect(() => {
    if (!gckSummaryFilters.state) {
      setGckSummaryRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(gckSummaryFilters.state)}`)
      .then((data) => setGckSummaryRegions(data.items || []))
      .catch(() => setGckSummaryRegions([]));
  }, [gckSummaryFilters.state]);

  useEffect(() => {
    if (!retreat.state) {
      setRetreatRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(retreat.state)}`)
      .then((data) => setRetreatRegions(data.items || []))
      .catch(() => setRetreatRegions([]));
  }, [retreat.state]);

  useEffect(() => {
    if (!stateCongress.state) {
      setStateCongressRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(stateCongress.state)}`)
      .then((data) => setStateCongressRegions(data.items || []))
      .catch(() => setStateCongressRegions([]));
  }, [stateCongress.state]);

  useEffect(() => {
    if (!zonalRegistration.state) {
      setZonalRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(zonalRegistration.state)}`)
      .then((data) => setZonalRegions(data.items || []))
      .catch(() => setZonalRegions([]));
  }, [zonalRegistration.state]);

  useEffect(() => {
    if (!zonalRegistration.state) {
      setZonalInstitutions([]);
      return;
    }
    apiFetch(
      `/meta/institutions?state=${encodeURIComponent(zonalRegistration.state)}`
    )
      .then((data) => setZonalInstitutions(data.items || []))
      .catch(() => setZonalInstitutions([]));
  }, [zonalRegistration.state]);

  useEffect(() => {
    if (!zonalRegistration.state || !zonalRegistration.region) {
      setZonalCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        zonalRegistration.state
      )}&region=${encodeURIComponent(zonalRegistration.region)}`
    )
      .then((data) => setZonalCentres(data.items || []))
      .catch(() => setZonalCentres([]));
  }, [zonalRegistration.state, zonalRegistration.region]);

  useEffect(() => {
    if (!stateCongress.state || !stateCongress.region) {
      setStateCongressCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        stateCongress.state
      )}&region=${encodeURIComponent(stateCongress.region)}`
    )
      .then((data) => setStateCongressCentres(data.items || []))
      .catch(() => setStateCongressCentres([]));
  }, [stateCongress.state, stateCongress.region]);

  useEffect(() => {
    if (!zonalRegistration.state) {
      setZonalClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: zonalRegistration.state,
      region: zonalRegistration.region,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setZonalClusters(data.items || []))
      .catch(() => setZonalClusters([]));
  }, [zonalRegistration.state, zonalRegistration.region]);

  useEffect(() => {
    if (!stateCongress.state) {
      setStateCongressClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: stateCongress.state,
      region: stateCongress.region,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setStateCongressClusters(data.items || []))
      .catch(() => setStateCongressClusters([]));
  }, [stateCongress.state, stateCongress.region]);

  useEffect(() => {
    if (!retreatReport.state) {
      setRetreatReportRegions([]);
      setRetreatReport((prev) => ({ ...prev, region: "" }));
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(retreatReport.state)}`)
      .then((data) => setRetreatReportRegions(data.items || []))
      .catch(() => setRetreatReportRegions([]));
  }, [retreatReport.state]);

  useEffect(() => {
    if (!retreat.state) {
      setRetreatClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: retreat.state,
      region: retreat.region,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setRetreatClusters(data.items || []))
      .catch(() => setRetreatClusters([]));
  }, [retreat.state, retreat.region]);

  useEffect(() => {
    if (!retreatClusterFilters.state) {
      setRetreatClusterRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(retreatClusterFilters.state)}`)
      .then((data) => setRetreatClusterRegions(data.items || []))
      .catch(() => setRetreatClusterRegions([]));
  }, [retreatClusterFilters.state]);

  useEffect(() => {
    if (!retreatCentreFilters.state) {
      setRetreatCentreRegions([]);
      setRetreatCentreFilters((prev) => ({ ...prev, region: "" }));
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(retreatCentreFilters.state)}`)
      .then((data) => setRetreatCentreRegions(data.items || []))
      .catch(() => setRetreatCentreRegions([]));
  }, [retreatCentreFilters.state]);

  useEffect(() => {
    if (!stateCongressReportFilters.state) {
      setStateCongressReportRegions([]);
      return;
    }
    apiFetch(
      `/meta/regions?state=${encodeURIComponent(stateCongressReportFilters.state)}`
    )
      .then((data) => setStateCongressReportRegions(data.items || []))
      .catch(() => setStateCongressReportRegions([]));
  }, [stateCongressReportFilters.state]);

  useEffect(() => {
    if (!stateCongressCategoryFilters.state) {
      setStateCongressCategoryRegions([]);
      return;
    }
    apiFetch(
      `/meta/regions?state=${encodeURIComponent(stateCongressCategoryFilters.state)}`
    )
      .then((data) => setStateCongressCategoryRegions(data.items || []))
      .catch(() => setStateCongressCategoryRegions([]));
  }, [stateCongressCategoryFilters.state]);

  useEffect(() => {
    if (!stateCongressClusterFilters.state) {
      setStateCongressClusterReportClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: stateCongressClusterFilters.state,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setStateCongressClusterReportClusters(data.items || []))
      .catch(() => setStateCongressClusterReportClusters([]));
  }, [stateCongressClusterFilters.state]);

  useEffect(() => {
    if (!retreatClusterFilters.state) {
      setRetreatReportClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: retreatClusterFilters.state,
      region: retreatClusterFilters.region,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setRetreatReportClusters(data.items || []))
      .catch(() => setRetreatReportClusters([]));
  }, [retreatClusterFilters.state, retreatClusterFilters.region]);

  useEffect(() => {
    if (!retreat.state || !retreat.region) {
      setRetreatCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        retreat.state
      )}&region=${encodeURIComponent(retreat.region)}`
    )
      .then((data) => setRetreatCentres(data.items || []))
      .catch(() => setRetreatCentres([]));
  }, [retreat.state, retreat.region]);

  useEffect(() => {
    if (!biodata.state) {
      setBiodataRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(biodata.state)}`)
      .then((data) => setBiodataRegions(data.items || []))
      .catch(() => setBiodataRegions([]));
  }, [biodata.state]);

  useEffect(() => {
    if (!biodata.state || !biodata.region) {
      setBiodataClusters([]);
      return;
    }
    const params = new URLSearchParams({
      state: biodata.state,
      region: biodata.region,
    });
    apiFetch(`/meta/clusters?${params.toString()}`)
      .then((data) => setBiodataClusters(data.items || []))
      .catch(() => setBiodataClusters([]));
  }, [biodata.state, biodata.region]);

  useEffect(() => {
    if (!biodata.state) {
      setInstitutions([]);
      return;
    }
    apiFetch(`/meta/institutions?state=${encodeURIComponent(biodata.state)}`)
      .then((data) => setInstitutions(data.items || []))
      .catch(() => setInstitutions([]));
  }, [biodata.state]);

  useEffect(() => {
    if (!biodata.state || !biodata.region) {
      setBiodataCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        biodata.state
      )}&region=${encodeURIComponent(biodata.region)}`
    )
      .then((data) => setBiodataCentres(data.items || []))
      .catch(() => setBiodataCentres([]));
  }, [biodata.state, biodata.region]);

  useEffect(() => {
    if (!biodataFilters.state) {
      setBiodataFilterRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(biodataFilters.state)}`)
      .then((data) => setBiodataFilterRegions(data.items || []))
      .catch(() => setBiodataFilterRegions([]));
  }, [biodataFilters.state]);

  useEffect(() => {
    if (!biodataFilters.state || !biodataFilters.region) {
      setBiodataFilterCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        biodataFilters.state
      )}&region=${encodeURIComponent(biodataFilters.region)}`
    )
      .then((data) => setBiodataFilterCentres(data.items || []))
      .catch(() => setBiodataFilterCentres([]));
  }, [biodataFilters.state, biodataFilters.region]);

  useEffect(() => {
    if (!adminRegionState) {
      setAdminRegions([]);
      return;
    }
    apiFetch(`/admin/regions?state=${encodeURIComponent(adminRegionState)}`)
      .then((data) => setAdminRegions(data.items || []))
      .catch(() => setAdminRegions([]));
  }, [adminRegionState]);

  useEffect(() => {
    if (!adminInstitutionState) {
      setAdminInstitutions([]);
      return;
    }
    loadAdminInstitutions(adminInstitutionState);
  }, [adminInstitutionState]);

  useEffect(() => {
    if (!adminFellowshipState) {
      setAdminFellowshipRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(adminFellowshipState)}`)
      .then((data) => setAdminFellowshipRegions(data.items || []))
      .catch(() => setAdminFellowshipRegions([]));
  }, [adminFellowshipState]);

  useEffect(() => {
    if (!adminFellowshipEditState) {
      setAdminFellowshipEditRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(adminFellowshipEditState)}`)
      .then((data) => setAdminFellowshipEditRegions(data.items || []))
      .catch(() => setAdminFellowshipEditRegions([]));
  }, [adminFellowshipEditState]);

  useEffect(() => {
    if (!adminFellowshipState || !adminFellowshipRegion) {
      setAdminFellowships([]);
      return;
    }
    loadAdminFellowships(adminFellowshipState, adminFellowshipRegion);
  }, [adminFellowshipRegion, adminFellowshipState]);

  useEffect(() => {
    if (!newUser.state) {
      setNewUserRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(newUser.state)}`)
      .then((data) => setNewUserRegions(data.items || []))
      .catch(() => setNewUserRegions([]));
  }, [newUser.state]);

  useEffect(() => {
    if (!newUser.state || !newUser.region) {
      setNewUserCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        newUser.state
      )}&region=${encodeURIComponent(newUser.region)}`
    )
      .then((data) => setNewUserCentres(data.items || []))
      .catch(() => setNewUserCentres([]));
  }, [newUser.state, newUser.region]);

  useEffect(() => {
    if (!editUser.state) {
      setEditUserRegions([]);
      return;
    }
    apiFetch(`/meta/regions?state=${encodeURIComponent(editUser.state)}`)
      .then((data) => setEditUserRegions(data.items || []))
      .catch(() => setEditUserRegions([]));
  }, [editUser.state]);

  useEffect(() => {
    if (!editUser.state || !editUser.region) {
      setEditUserCentres([]);
      return;
    }
    apiFetch(
      `/meta/fellowships?state=${encodeURIComponent(
        editUser.state
      )}&region=${encodeURIComponent(editUser.region)}`
    )
      .then((data) => setEditUserCentres(data.items || []))
      .catch(() => setEditUserCentres([]));
  }, [editUser.state, editUser.region]);

  useEffect(() => {
    if (!editUserId) {
      setEditUser({
        name: "",
        email: "",
        password: "",
        role: "",
        state: "",
        region: "",
        fellowship_centre: "",
        work_units: [],
      });
      return;
    }
    const selected = adminUsers.find((item) => String(item.id) === editUserId);
    if (!selected) {
      return;
    }
    setEditUser({
      name: selected.name || "",
      email: selected.email || "",
      password: "",
      role: selected.role || "",
      state: selected.state || "",
      region: selected.region || "",
      fellowship_centre: selected.fellowship_centre || "",
      work_units: selected.work_units || [],
    });
  }, [adminUsers, editUserId]);

  const updateCount = (group, gender, value) => {
    setAttendance((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [group]: {
          ...prev.counts[group],
          [gender]: Number(value) || 0,
        },
      },
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await ensureCsrf();
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(login),
      });
      setUser(data.user);
      setLogin({ email: "", password: "" });
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleLogout = async () => {
    setStatus("");
    try {
      await apiFetch("/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadAttendanceEntry = async () => {
    const params = new URLSearchParams({
      entry_date: attendance.entry_date,
      service_day: attendance.service_day,
      state: attendance.state,
      region: attendance.region,
      fellowship_centre: attendance.fellowship_centre,
    });
    const data = await apiFetch(`/attendance/details?${params.toString()}`);
    setAttendance({
      entry_date: data.entry_date || attendance.entry_date,
      service_day: data.service_day || attendance.service_day,
      state: data.state || attendance.state,
      region: data.region || attendance.region,
      fellowship_centre: data.fellowship_centre || attendance.fellowship_centre,
      counts: data.counts || emptyCounts,
    });
    setAttendanceEntryId(String(data.id || ""));
    setAttendanceEntryKey(
      buildAttendanceKey({
        entry_date: data.entry_date,
        service_day: data.service_day,
        state: data.state,
        region: data.region,
        fellowship_centre: data.fellowship_centre,
      })
    );
  };

  const submitAttendance = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (attendanceEntryId) {
        await apiFetch(`/attendance/${attendanceEntryId}`, {
          method: "PUT",
          body: JSON.stringify({ counts: attendance.counts }),
        });
        setStatus("Attendance updated.");
        return;
      }
      const data = await apiFetch("/attendance", {
        method: "POST",
        body: JSON.stringify(attendance),
      });
      setAttendanceEntryId(String(data.id || ""));
      setAttendanceEntryKey(buildAttendanceKey(attendance));
      setStatus("Attendance saved.");
    } catch (err) {
      if (err.message.toLowerCase().includes("already submitted")) {
        try {
          await loadAttendanceEntry();
          setStatus("Existing entry loaded. Update the counts and save.");
        } catch (loadErr) {
          setStatus(loadErr.message);
        }
        return;
      }
      setStatus(err.message);
    }
  };

  const loadReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(report);
      const data = await apiFetch(`/reports/summary?${params.toString()}`);
      setReportData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadGckReport = async () => {
    const params = new URLSearchParams({
      report_month: gckReport.report_month,
      state: gckReport.state,
      region: gckReport.region,
      fellowship_centre: gckReport.fellowship_centre,
    });
    const data = await apiFetch(`/gck/details?${params.toString()}`);
    setGckReport({
      report_month: data.report_month || gckReport.report_month,
      state: data.state || gckReport.state,
      region: data.region || gckReport.region,
      fellowship_centre: data.fellowship_centre || gckReport.fellowship_centre,
      sessions: data.sessions || [],
    });
    setGckEntryId(String(data.id || ""));
    setGckEntryKey(
      buildGckKey({
        report_month: data.report_month,
        state: data.state,
        region: data.region,
        fellowship_centre: data.fellowship_centre,
      })
    );
  };

  const submitGckReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (!gckReport.report_month) {
        setStatus("Select a report month.");
        return;
      }
      const overflowDays = 7;
      const [year, month] = gckReport.report_month.split("-").map(Number);
      const nextMonthDate = new Date(year, month, 1);
      const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(
        nextMonthDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const allowedDate = (dateValue) => {
        if (!dateValue) return true;
        const sessionMonth = dateValue.slice(0, 7);
        if (sessionMonth === gckReport.report_month) {
          return true;
        }
        if (sessionMonth === nextMonthKey) {
          const day = Number(dateValue.slice(8, 10));
          return day <= overflowDays;
        }
        return false;
      };
      const seenSessions = new Set();
      const invalidSession = gckReport.sessions.find((session) => {
        if (!session.date) return false;
        const key = `${session.date}|${session.period || ""}`;
        if (seenSessions.has(key)) {
          setStatus(`Duplicate session date and period: ${session.date}.`);
          return true;
        }
        seenSessions.add(key);
        return !allowedDate(session.date);
      });
      if (invalidSession) {
        if (!status) {
          setStatus(
            `Session date ${invalidSession.date} must be within ${gckReport.report_month} or the first week of ${nextMonthKey}.`
          );
        }
        return;
      }
      if (gckEntryId) {
        await apiFetch(`/gck/${gckEntryId}`, {
          method: "PUT",
          body: JSON.stringify({ sessions: gckReport.sessions }),
        });
        setStatus("GCK report updated.");
        return;
      }
      const data = await apiFetch("/gck", {
        method: "POST",
        body: JSON.stringify(gckReport),
      });
      setGckEntryId(String(data.id || ""));
      setGckEntryKey(buildGckKey(gckReport));
      setStatus("GCK report submitted.");
    } catch (err) {
      if (err.message.toLowerCase().includes("already submitted")) {
        try {
          await loadGckReport();
          setStatus("Existing GCK report loaded. Update and save.");
        } catch (loadErr) {
          setStatus(loadErr.message);
        }
        return;
      }
      setStatus(err.message);
    }
  };

  const loadGckSummary = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(gckSummaryFilters);
      const data = await apiFetch(`/gck/summary?${params.toString()}`);
      setGckSummary(data.items || []);
      setGckSummaryMeta({
        group_name: data.meta?.group_name || "DLCF",
        coordinator_name: data.meta?.coordinator_name || "",
        report_month: data.meta?.report_month || gckSummaryFilters.report_month,
        state: data.meta?.state || gckSummaryFilters.state,
      });
    } catch (err) {
      setStatus(err.message);
    }
  };

  const submitRetreat = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (retreatEntryId) {
        await apiFetch(`/retreat-registrations/${retreatEntryId}`, {
          method: "PUT",
          body: JSON.stringify(retreat),
        });
        setStatus("Retreat registration updated.");
        return;
      }
      const data = await apiFetch("/retreat-registrations", {
        method: "POST",
        body: JSON.stringify(retreat),
      });
      setRetreatEntryId(String(data.id || ""));
      setRetreatEntryKey(buildRetreatKey(retreat));
      setStatus("Retreat registration submitted.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadRetreatEntry = async (payload) => {
    const params = new URLSearchParams(payload);
    const data = await apiFetch(
      `/retreat-registrations/lookup?${params.toString()}`
    );
    setRetreat({
      retreat_type: data.retreat_type || retreat.retreat_type,
      title: data.title || retreat.title,
      full_name: data.full_name || retreat.full_name,
      gender: data.gender || retreat.gender,
      email: data.email || retreat.email,
      phone: data.phone || retreat.phone,
      category: data.category || retreat.category,
      membership_status: data.membership_status || retreat.membership_status,
      cluster: data.cluster || "",
      dlcf_center: data.dlcf_center || retreat.dlcf_center,
      registration_date: data.registration_date || retreat.registration_date,
      state: data.state || retreat.state,
      region: data.region || retreat.region,
      fellowship_centre: data.fellowship_centre || retreat.fellowship_centre,
    });
    setRetreatEntryId(String(data.id || ""));
    setRetreatEntryKey(
      buildRetreatKey({
        retreat_type: data.retreat_type,
        registration_date: data.registration_date,
        email: data.email,
        phone: data.phone,
      })
    );
  };

  const loadStateCongressSettings = async () => {
    try {
      const data = await apiFetch("/state-congress/settings");
      setStateCongressSettings({
        start_date: data.item?.start_date || "",
        end_date: data.item?.end_date || "",
      });
    } catch {
      setStateCongressSettings({ start_date: "", end_date: "" });
    }
  };

  const saveStateCongressSettings = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/state-congress/settings", {
        method: "PUT",
        body: JSON.stringify(stateCongressSettings),
      });
      setStatus("State congress dates saved.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadStateCongressSettings();
  }, [user]);

  const loadZonalCongressSettings = async () => {
    try {
      const data = await apiFetch("/zonal-congress/settings");
      setZonalSettings({
        start_date: data.item?.start_date || "",
        end_date: data.item?.end_date || "",
      });
    } catch {
      setZonalSettings({ start_date: "", end_date: "" });
    }
  };

  const saveZonalCongressSettings = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/zonal-congress/settings", {
        method: "PUT",
        body: JSON.stringify(zonalSettings),
      });
      setStatus("Zonal congress dates saved.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadZonalCongressSettings();
  }, [user]);

  const submitStateCongress = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (stateCongressEntryId) {
        await apiFetch(`/state-congress-registrations/${stateCongressEntryId}`, {
          method: "PUT",
          body: JSON.stringify(stateCongress),
        });
        setStatus("State congress registration updated.");
        return;
      }
      const data = await apiFetch("/state-congress-registrations", {
        method: "POST",
        body: JSON.stringify(stateCongress),
      });
      setStateCongressEntryId(String(data.id || ""));
      setStateCongressEntryKey(buildStateCongressKey(stateCongress));
      setStatus("State congress registration submitted.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStateCongressEntry = async (payload) => {
    const params = new URLSearchParams(payload);
    const data = await apiFetch(
      `/state-congress-registrations/lookup?${params.toString()}`
    );
    setStateCongress({
      title: data.title || stateCongress.title,
      full_name: data.full_name || stateCongress.full_name,
      gender: data.gender || stateCongress.gender,
      email: data.email || stateCongress.email,
      phone: data.phone || stateCongress.phone,
      category: data.category || stateCongress.category,
      membership_status: data.membership_status || stateCongress.membership_status,
      cluster: data.cluster || "",
      registration_date: data.registration_date || stateCongress.registration_date,
      state: data.state || stateCongress.state,
      region: data.region || stateCongress.region,
      fellowship_centre: data.fellowship_centre || stateCongress.fellowship_centre,
    });
    setStateCongressEntryId(String(data.id || ""));
    setStateCongressEntryKey(
      buildStateCongressKey({
        registration_date: data.registration_date,
        email: data.email,
        phone: data.phone,
      })
    );
  };

  const loadStateCongressRegionReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stateCongressReportFilters);
      const data = await apiFetch(
        `/state-congress-reports/regions-by-day?${params.toString()}`
      );
      setStateCongressReportData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStateCongressCategoryReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stateCongressCategoryFilters);
      const data = await apiFetch(
        `/state-congress-reports/categories-by-region?${params.toString()}`
      );
      setStateCongressCategoryData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStateCongressMembershipReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stateCongressMembershipFilters);
      const data = await apiFetch(
        `/state-congress-reports/membership-by-region?${params.toString()}`
      );
      setStateCongressMembershipData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStateCongressInstitutionReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stateCongressInstitutionFilters);
      const data = await apiFetch(
        `/state-congress-reports/membership-by-institution?${params.toString()}`
      );
      setStateCongressInstitutionData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStateCongressClusterReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stateCongressClusterFilters);
      const data = await apiFetch(
        `/state-congress-reports/membership-by-cluster?${params.toString()}`
      );
      setStateCongressClusterData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadZonalDailyReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(zonalDailyFilters);
      const data = await apiFetch(
        `/zonal-congress-reports/states-by-day?${params.toString()}`
      );
      setZonalDailyData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadZonalMembershipReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(zonalMembershipFilters);
      const data = await apiFetch(
        `/zonal-congress-reports/membership-by-state?${params.toString()}`
      );
      setZonalMembershipData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const submitStmc = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/stmc-registrations", {
        method: "POST",
        body: JSON.stringify(stmc),
      });
      setStatus("STMC registration submitted.");
      setStmc((prev) => ({ ...prev, matric_number: "", payment_amount: "" }));
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadStmcReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(stmcReportFilters);
      const data = await apiFetch(`/stmc-reports?${params.toString()}`);
      setStmcReportData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadRetreatReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(retreatReport);
      const data = await apiFetch(
        `/retreat-registrations?${params.toString()}`
      );
      setRetreatReportData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadRetreatClusterReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(retreatClusterFilters);
      const data = await apiFetch(
        `/retreat-reports/cluster-days?${params.toString()}`
      );
      setRetreatClusterData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadRetreatCentreReport = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(retreatCentreFilters);
      const data = await apiFetch(
        `/retreat-reports/centres?${params.toString()}`
      );
      setRetreatCentreData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const submitZonalRegistration = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (zonalEntryId) {
        await apiFetch(`/zonal-registrations/${zonalEntryId}`, {
          method: "PUT",
          body: JSON.stringify(zonalRegistration),
        });
        setStatus("Zonal congress registration updated.");
        return;
      }
      const data = await apiFetch("/zonal-registrations", {
        method: "POST",
        body: JSON.stringify(zonalRegistration),
      });
      setZonalEntryId(String(data.id || ""));
      setZonalEntryKey(buildZonalKey(zonalRegistration));
      setStatus("Zonal congress registration submitted.");
      setZonalRegistration((prev) => ({
        ...prev,
        full_name: "",
        email: "",
        phone: "",
      }));
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadZonalEntry = async (payload) => {
    const params = new URLSearchParams(payload);
    const data = await apiFetch(
      `/zonal-registrations/lookup?${params.toString()}`
    );
    setZonalRegistration({
      title: data.title || "Mr.",
      full_name: data.full_name || "",
      gender: data.gender || "Male",
      email: data.email || "",
      phone: data.phone || "",
      category: data.category || "Student",
      membership_status: data.membership_status || "Member",
      registration_date: data.registration_date || "",
      state: data.state || "",
      region: data.region || "",
      cluster: data.cluster || "",
      institution: data.institution || "",
      fellowship_centre: data.fellowship_centre || "",
    });
    setZonalEntryId(String(data.id || ""));
    setZonalEntryKey(buildZonalKey(data));
  };

  const submitBiodata = async (event) => {
    event.preventDefault();
    setStatus("");
    if (
      user?.email &&
      biodata.email &&
      user.email.toLowerCase() !== biodata.email.toLowerCase()
    ) {
      setStatus("Email must match your account email.");
      return;
    }
    try {
      if (biodataIsSelf) {
        await apiFetch("/biodata/me", {
          method: "PUT",
          body: JSON.stringify(biodata),
        });
        setStatus("Profile updated.");
      } else if (biodataEntryId) {
        await apiFetch(`/biodata/${biodataEntryId}`, {
          method: "PUT",
          body: JSON.stringify(biodata),
        });
        setStatus("Biodata updated.");
        setBiodataEntryId("");
      } else {
        await apiFetch("/biodata", {
          method: "POST",
          body: JSON.stringify(biodata),
        });
        setStatus("Biodata submitted.");
      }
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadMyBiodata = useCallback(async () => {
    setStatus("");
    try {
      const data = await apiFetch("/biodata/me");
      setBiodata({
        full_name: data.item.full_name || "",
        gender: data.item.gender || "Male",
        age: data.item.age || "",
        phone: data.item.phone || "",
        email: data.item.email || "",
        profile_photo: data.item.profile_photo || "",
        school: data.item.school || "",
        category: data.item.category || "",
        worker_status: data.item.worker_status || "Member",
        membership_status: data.item.membership_status || "Member",
        work_units: data.item.work_units || [],
        address: data.item.address || "",
        next_of_kin_name: data.item.next_of_kin_name || "",
        next_of_kin_phone: data.item.next_of_kin_phone || "",
        next_of_kin_relationship: data.item.next_of_kin_relationship || "",
        state: data.item.state || "",
        region: data.item.region || "",
        cluster: data.item.cluster || "",
        fellowship_centre: data.item.fellowship_centre || "",
      });
      setBiodataEntryId("");
      setBiodataIsSelf(true);
    } catch (err) {
      if (err.message === "Not found") {
        setBiodataIsSelf(false);
      } else {
        setStatus(err.message);
      }
    }
  }, []);

  const loadBiodataEntry = async (id) => {
    setStatus("");
    try {
      const data = await apiFetch(`/biodata/${id}`);
      setBiodata({
        full_name: data.item.full_name || "",
        gender: data.item.gender || "Male",
        age: data.item.age || "",
        phone: data.item.phone || "",
        email: data.item.email || "",
        profile_photo: data.item.profile_photo || "",
        school: data.item.school || "",
        category: data.item.category || "",
        worker_status: data.item.worker_status || "Member",
        membership_status: data.item.membership_status || "Member",
        work_units: data.item.work_units || [],
        address: data.item.address || "",
        next_of_kin_name: data.item.next_of_kin_name || "",
        next_of_kin_phone: data.item.next_of_kin_phone || "",
        next_of_kin_relationship: data.item.next_of_kin_relationship || "",
        state: data.item.state || "",
        region: data.item.region || "",
        cluster: data.item.cluster || "",
        fellowship_centre: data.item.fellowship_centre || "",
      });
      setBiodataEntryId(String(data.item.id || id));
      setBiodataIsSelf(false);
      navigate("/biodata");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const deleteBiodataEntry = async (id) => {
    if (!window.confirm("Delete this biodata entry?")) {
      return;
    }
    setStatus("");
    try {
      await apiFetch(`/biodata/${id}`, { method: "DELETE" });
      setBiodataData((prev) => prev.filter((item) => item.id !== id));
      if (String(id) === biodataEntryId) {
        setBiodataEntryId("");
      }
      setStatus("Biodata deleted.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadBiodata = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const params = new URLSearchParams(biodataFilters);
      const data = await apiFetch(`/biodata?${params.toString()}`);
      setBiodataData(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadAdminStates = async () => {
    try {
      const data = await apiFetch("/admin/states");
      setAdminStates(data.items || []);
      const meta = await apiFetch("/meta/states");
      setStates(meta.items || []);
    } catch {
      setAdminStates([]);
    }
  };

  const loadAdminRegions = async (state) => {
    if (!state) {
      setAdminRegions([]);
      return;
    }
    try {
      const data = await apiFetch(
        `/admin/regions?state=${encodeURIComponent(state)}`
      );
      setAdminRegions(data.items || []);
    } catch {
      setAdminRegions([]);
    }
  };

  const loadAdminInstitutions = async (state) => {
    if (!state) {
      setAdminInstitutions([]);
      return;
    }
    try {
      const data = await apiFetch(
        `/admin/institutions?state=${encodeURIComponent(state)}`
      );
      setAdminInstitutions(data.items || []);
    } catch {
      setAdminInstitutions([]);
    }
  };

  const loadAdminFellowships = async (state, region) => {
    if (!state || !region) {
      setAdminFellowships([]);
      return;
    }
    try {
      const data = await apiFetch(
        `/admin/fellowships?state=${encodeURIComponent(
          state
        )}&region=${encodeURIComponent(region)}`
      );
      setAdminFellowships(data.items || []);
    } catch {
      setAdminFellowships([]);
    }
  };

  const loadAdminWorkUnits = async () => {
    try {
      const data = await apiFetch("/admin/work-units");
      setAdminWorkUnits(data.items || []);
      const meta = await apiFetch("/meta/work-units");
      setWorkUnitsList(meta.items || []);
    } catch {
      setAdminWorkUnits([]);
    }
  };

  const loadAdminRoles = async () => {
    try {
      const data = await apiFetch("/admin/roles");
      setAdminRoles(data.items || []);
    } catch {
      setAdminRoles([]);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const data = await apiFetch("/admin/users");
      setAdminUsers(data.items || []);
    } catch {
      setAdminUsers([]);
    }
  };

  const toggleWorkUnit = (unit, setter) => {
    setter((prev) => {
      const next = { ...prev };
      const current = Array.isArray(next.work_units) ? next.work_units : [];
      if (current.includes(unit)) {
        next.work_units = current.filter((item) => item !== unit);
      } else {
        next.work_units = [...current, unit];
      }
      return next;
    });
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      setStatus("User created.");
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        state: "",
        region: "",
        fellowship_centre: "",
        work_units: [],
      });
      setNewUserRegions([]);
      setNewUserCentres([]);
      loadAdminUsers();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleEditUser = async (event) => {
    event.preventDefault();
    if (!editUserId) return;
    setStatus("");
    try {
      await apiFetch(`/admin/users/${editUserId}`, {
        method: "PUT",
        body: JSON.stringify(editUser),
      });
      setStatus("User updated.");
      setEditUserId("");
      loadAdminUsers();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    setStatus("");
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      setStatus("User deleted.");
      loadAdminUsers();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadAdminCategories = async () => {
    try {
      const data = await apiFetch("/admin/categories");
      setAdminCategories(data.items || []);
    } catch {
      setAdminCategories([]);
    }
  };

  const loadAdminStatePosts = async (state) => {
    if (!state) {
      setAdminStatePosts([]);
      return;
    }
    try {
      const data = await apiFetch(
        `/state/posts?state=${encodeURIComponent(state)}`
      );
      setAdminStatePosts(data.items || []);
    } catch {
      setAdminStatePosts([]);
    }
  };

  const handleAddStatePost = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const payload = {
        state: adminStatePostState,
        title: adminStatePostTitle,
        content: adminStatePostContent,
        type: adminStatePostType,
        status: adminStatePostStatus,
        feature_image_url: adminStatePostFeatureImage,
        category_ids: adminStatePostCategoryIds,
      };
      if (adminStatePostPublishedAt) {
        payload.published_at = adminStatePostPublishedAt;
      }
      await apiFetch("/state/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("State update created.");
      setAdminStatePostTitle("");
      setAdminStatePostType("");
      setAdminStatePostStatus("draft");
      setAdminStatePostPublishedAt("");
      setAdminStatePostFeatureImage("");
      setAdminStatePostContent("");
      setAdminStatePostCategoryIds([]);
      loadAdminStatePosts(adminStatePostState);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleEditStatePost = async (event) => {
    event.preventDefault();
    if (!adminStatePostEditId) return;
    setStatus("");
    try {
      const payload = {
        title: adminStatePostTitle,
        content: adminStatePostContent,
        type: adminStatePostType,
        status: adminStatePostStatus,
        published_at: adminStatePostPublishedAt || "",
        feature_image_url: adminStatePostFeatureImage,
        category_ids: adminStatePostCategoryIds,
      };
      await apiFetch(`/state/posts/${adminStatePostEditId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatus("State update updated.");
      setAdminStatePostEditId("");
      loadAdminStatePosts(adminStatePostState);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleDeleteStatePost = async (id) => {
    if (!window.confirm("Delete this update?")) {
      return;
    }
    setStatus("");
    try {
      await apiFetch(`/state/posts/${id}`, { method: "DELETE" });
      setStatus("State update deleted.");
      loadAdminStatePosts(adminStatePostState);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return "";
    const token = await ensureCsrf();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/admin/uploads`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": token,
      },
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      const message = json?.error || "Upload failed";
      throw new Error(message);
    }
    return json?.data?.url || "";
  };

  const loadAdminStateHome = async (state) => {
    if (!state) {
      setAdminStateHomeContent(null);
      return;
    }
    try {
      const data = await apiFetch(
        `/state/home?state=${encodeURIComponent(state)}`
      );
      setAdminStateHomeContent(
        data.item
          ? JSON.parse(JSON.stringify(data.item))
          : JSON.parse(JSON.stringify(defaultStateHomeContent))
      );
    } catch {
      setAdminStateHomeContent(
        JSON.parse(JSON.stringify(defaultStateHomeContent))
      );
    }
  };

  const handleSaveStateHome = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/state/home", {
        method: "PUT",
        body: JSON.stringify({
          state: adminStateHomeState,
          content: adminStateHomeContent || defaultStateHomeContent,
        }),
      });
      setStatus("State homepage updated.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiFetch("/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: adminCategoryName }),
      });
      setAdminCategoryName("");
      setStatus("Category added.");
      loadAdminCategories();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleEditCategory = async (event) => {
    event.preventDefault();
    if (!adminCategoryEditId) return;
    setStatus("");
    try {
      await apiFetch(`/admin/categories/${adminCategoryEditId}`, {
        method: "PUT",
        body: JSON.stringify({ name: adminCategoryEditName }),
      });
      setAdminCategoryEditId("");
      setAdminCategoryEditName("");
      setStatus("Category updated.");
      loadAdminCategories();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }
    setStatus("");
    try {
      await apiFetch(`/admin/categories/${id}`, { method: "DELETE" });
      setStatus("Category deleted.");
      loadAdminCategories();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const adminPageProps = {
    user,
    canViewAdmin,
    canManageStates,
    canManageRegions,
    canManageFellowships,
    canManageInstitutions,
    canManageWorkUnits,
    canManageRoles,
    canManageUsers,
    canPublishMedia,
    canManageMedia,
    canManagePublications,
    canManageStatePosts,
    canManageCategories,
    canManageStateHome,
    canManageStateCongress,
    canManageZonalCongress,
    states,
    adminStates,
    adminRegions,
    adminFellowships,
    adminInstitutions,
    adminWorkUnits,
    adminRoles,
    adminUsers,
    adminStatePosts,
    adminCategories,
    stateOptions: states.map(s => typeof s === 'string' ? s : s.name || s),
    adminStateName,
    adminStateEditId,
    adminStateEditName,
    adminRegionState,
    adminRegionName,
    adminRegionEditId,
    adminRegionEditName,
    adminRegionEditState,
    adminFellowshipState,
    adminFellowshipRegion,
    adminFellowshipName,
    adminFellowshipRegions,
    adminFellowshipEditId,
    adminFellowshipEditName,
    adminFellowshipEditState,
    adminFellowshipEditRegion,
    adminFellowshipEditRegions,
    adminInstitutionState,
    adminInstitutionName,
    adminInstitutionEditId,
    adminInstitutionEditName,
    adminInstitutionEditState,
    adminWorkUnitName,
    adminWorkUnitEditId,
    adminWorkUnitEditName,
    adminRoleName,
    adminRoleEditId,
    adminRoleEditName,
    adminCategoryName,
    adminCategoryEditId,
    adminCategoryEditName,
    adminStateHomeState,
    adminStateHomeContent,
    adminStatePostState,
    adminStatePostTitle,
    adminStatePostType,
    adminStatePostStatus,
    adminStatePostPublishedAt,
    adminStatePostFeatureImage,
    adminStatePostContent,
    adminStatePostCategoryIds,
    adminStatePostEditId,
    stateCongressSettings,
    zonalSettings,
    newUser,
    newUserRegions,
    newUserCentres,
    editUserId,
    editUser,
    editUserRegions,
    editUserCentres,
    workUnitsList,
    status,
    setStatus,
    setAdminStateName,
    setAdminStateEditId,
    setAdminStateEditName,
    setAdminRegionState,
    setAdminRegionName,
    setAdminRegionEditId,
    setAdminRegionEditName,
    setAdminRegionEditState,
    setAdminFellowshipState,
    setAdminFellowshipRegion,
    setAdminFellowshipName,
    setAdminFellowshipEditId,
    setAdminFellowshipEditName,
    setAdminFellowshipEditState,
    setAdminFellowshipEditRegion,
    setAdminInstitutionState,
    setAdminInstitutionName,
    setAdminInstitutionEditId,
    setAdminInstitutionEditName,
    setAdminInstitutionEditState,
    setAdminWorkUnitName,
    setAdminWorkUnitEditId,
    setAdminWorkUnitEditName,
    setAdminRoleName,
    setAdminRoleEditId,
    setAdminRoleEditName,
    setAdminCategoryName,
    setAdminCategoryEditId,
    setAdminCategoryEditName,
    setAdminStateHomeState,
    setAdminStateHomeContent,
    setAdminStatePostState,
    setAdminStatePostTitle,
    setAdminStatePostType,
    setAdminStatePostStatus,
    setAdminStatePostPublishedAt,
    setAdminStatePostFeatureImage,
    setAdminStatePostContent,
    setAdminStatePostCategoryIds,
    setAdminStatePostEditId,
    setStateCongressSettings,
    setZonalSettings,
    setNewUser,
    setEditUserId,
    setEditUser,
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
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    toggleWorkUnit,
    handleAddStatePost,
    handleEditStatePost,
    handleDeleteStatePost,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSaveStateHome,
    loadStateCongressSettings,
    saveStateCongressSettings,
    loadZonalCongressSettings,
    saveZonalCongressSettings,
    uploadImage,
  };

  if (isPublicPage) {
    const segments = location.pathname.split("/").filter(Boolean);
    const isLegacyStatePath = location.pathname.startsWith("/states/");
    const isLegacyStatePostPath =
      segments[0] === "states" && segments[2] === "updates" && segments[3];
    const isStatePostPath =
      isStatePath && segments[1] === "updates" && segments[2];
    const stateSlug = isLegacyStatePath ? segments[1] : firstSegment;
    const postSlug = isLegacyStatePostPath ? segments[3] : segments[2];
    const isZonalMediaList = segments[0] === "media" && !segments[1];
    const isZonalMediaDetail = segments[0] === "media" && segments[1];
    const isZonalPublicationList = segments[0] === "publications" && !segments[1];
    const isZonalPublicationDetail = segments[0] === "publications" && segments[1];
    const isStateMediaList = isStatePath && segments[1] === "media" && !segments[2];
    const isStateMediaDetail =
      isStatePath && segments[1] === "media" && segments[2];
    const isStatePublicationList =
      isStatePath && segments[1] === "publications" && !segments[2];
    const isStatePublicationDetail =
      isStatePath && segments[1] === "publications" && segments[2];
    return (
      <div className="public-shell">
        {location.pathname === "/" ? (
          <PublicHome states={states} stateSummaries={stateSummaries} user={user} />
        ) : location.pathname === "/beliefs" ? (
          <BeliefsPage user={user} />
        ) : location.pathname === "/states" ? (
          <StatesPage states={states} user={user} />
        ) : isZonalMediaList ? (
          <PublicMediaListPage user={user} />
        ) : isZonalMediaDetail ? (
          <PublicMediaDetailPage user={user} mediaId={segments[1]} />
        ) : isZonalPublicationList ? (
          <GospelLibraryPage user={user} />
        ) : isZonalPublicationDetail ? (
          <PublicationsDetailPage publicationId={segments[1]} />
        ) : isStateMediaList ? (
          <StateMediaListPage stateSlug={stateSlug} states={states} />
        ) : isStateMediaDetail ? (
          <StateMediaDetailPage stateSlug={stateSlug} states={states} />
        ) : isStatePublicationList ? (
          <GospelLibraryPage stateSlug={stateSlug} states={states} user={user} />
        ) : isStatePublicationDetail ? (
          <StatePublicationsDetailPage stateSlug={stateSlug} states={states} publicationId={segments[2]} />
        ) : isLegacyStatePostPath || isStatePostPath ? (
          <StatePostPage
            stateSlug={stateSlug}
            postSlug={postSlug}
            states={states}
          />
        ) : isLegacyStatePath || isStatePath ? (
          <StateDetailPage stateSlug={stateSlug} states={states} />
        ) : (
          <AboutPage user={user} />
        )}
      </div>
    );
  }

  // Show standalone login page if user is not logged in
  if (!user) {
    return (
      <LoginPage
        login={login}
        setLogin={setLogin}
        handleLogin={handleLogin}
        status={status}
        states={states}
      />
    );
  }

  return (
    <div className={`app-shell ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <button
          className="sidebar-close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          ×
        </button>
        <Link className="brand" to="/">
          <div className="brand-mark">
            <img src="/logo.png" alt="DLCF" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <p className="brand-title">Deeper Life Campus Fellowship</p>
            <p className="brand-sub">South West Zone</p>
          </div>
        </Link>
        <div className="sidebar-user">
          <div className="avatar">
            {user ? user.name.charAt(0).toUpperCase() : "G"}
          </div>
          <div>
            <p className="user-name">{user ? user.name : "Guest"}</p>
            <p className="user-meta">{user ? user.email : "Sign in to continue"}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/">Home</Link>
          <Link to="/publications">Gospel Library</Link>
          <Link to="/portal">Attendance Portal</Link>
          {user ? <Link to="/attendance-report">Attendance Reports</Link> : null}
          <Link to="/gck">GCK Attendance</Link>
          {user ? <Link to="/gck-report">GCK Reports</Link> : null}
          <Link to="/stmc">STMC</Link>
          <Link to="/zonal-congress">Zonal Congress</Link>
          <Link to="/state-congress">State Congress</Link>
          <Link to="/retreat">Retreat</Link>
          {canViewAdmin ? (
            <Link to="/retreat-report">Retreat Reports</Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/retreat-report/cluster-days">
              Retreat Report by Day
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/retreat-report/centres">
              Retreat Report by Centre
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/state-congress-report/regions">
              State Congress Report by Region
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/state-congress-report/categories">
              State Congress Report by Category
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/state-congress-report/membership">
              State Congress Report by Membership
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/state-congress-report/institutions">
              State Congress Report by Institution
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/state-congress-report/clusters">
              State Congress Report by Cluster
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/zonal-congress-report/daily">
              Zonal Congress Report by Day
            </Link>
          ) : null}
          {canViewAdmin ? (
            <Link to="/zonal-congress-report/membership">
              Zonal Congress Report by Membership
            </Link>
          ) : null}
          {user ? <Link to="/profile">Profile</Link> : null}
          {user ? <Link to="/biodata">Biodata Form</Link> : null}
          {user ? <Link to="/biodata-list">Biodata List</Link> : null}
          {canViewAdmin ? <Link to="/admin">Admin</Link> : null}
        </nav>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Unified Weekly Portal</h1>
          </div>
          <div className="topbar-actions">
            {user ? (
              <>
                <span className="role-pill">{user.role}</span>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <span className="role-pill">Guest</span>
            )}
          </div>
        </header>
        <main className="content">
          <Routes>
            <Route
              path="/portal"
              element={
                <PortalHome
                  states={states}
                  stateSummaries={stateSummaries}
                  status={status}
                  user={user}
                  login={login}
                  setLogin={setLogin}
                  handleLogin={handleLogin}
                  submitAttendance={submitAttendance}
                  attendance={attendance}
                  setAttendance={setAttendance}
                  attendanceRegions={attendanceRegions}
                  attendanceCentres={attendanceCentres}
                  updateCount={updateCount}
                  total={total}
                  attendanceEntryId={attendanceEntryId}
                  loadAttendanceEntry={loadAttendanceEntry}
                />
              }
            />
            <Route
              path="/gck"
              element={
                <GckPage
                  user={user}
                  status={status}
                  gckReport={gckReport}
                  setGckReport={setGckReport}
                  gckRegions={gckRegions}
                  gckCentres={gckCentres}
                  submitGckReport={submitGckReport}
                  gckEntryId={gckEntryId}
                  loadGckReport={loadGckReport}
                  states={states}
                />
              }
            />
            <Route
              path="/attendance-report"
              element={
                <AttendanceReportPage
                  user={user}
                  status={status}
                  report={report}
                  setReport={setReport}
                  reportRegions={reportRegions}
                  loadReport={loadReport}
                  reportData={reportData}
                  states={states}
                />
              }
            />
            <Route
              path="/gck-report"
              element={
                <GckReportPage
                  user={user}
                  status={status}
                  gckSummaryFilters={gckSummaryFilters}
                  setGckSummaryFilters={setGckSummaryFilters}
                  gckSummaryRegions={gckSummaryRegions}
                  loadGckSummary={loadGckSummary}
                  gckSummary={gckSummary}
                  states={states}
                  gckSummaryMeta={gckSummaryMeta}
                />
              }
            />
            <Route path="/states/:stateId" element={<StateDetailPage />} />
            <Route
              path="/stmc"
              element={
                <STMCPage
                  status={status}
                  stmc={stmc}
                  setStmc={setStmc}
                  stmcRegions={stmcRegions}
                  stmcInstitutions={stmcInstitutions}
                  submitStmc={submitStmc}
                  stmcReportFilters={stmcReportFilters}
                  setStmcReportFilters={setStmcReportFilters}
                  stmcReportData={stmcReportData}
                  loadStmcReport={loadStmcReport}
                  states={states}
                />
              }
            />
            <Route
              path="/zonal-congress"
              element={
                <ZonalCongressPage
                  status={status}
                  zonalRegistration={zonalRegistration}
                  setZonalRegistration={setZonalRegistration}
                  zonalRegions={zonalRegions}
                  zonalCentres={zonalCentres}
                  zonalClusters={zonalClusters}
                  zonalInstitutions={zonalInstitutions}
                  zonalSettings={zonalSettings}
                  submitZonalRegistration={submitZonalRegistration}
                  states={states}
                  loadZonalEntry={loadZonalEntry}
                  zonalEntryId={zonalEntryId}
                />
              }
            />
            <Route
              path="/state-congress"
              element={
                <StateCongressPage
                  clusters={stateCongressClusters}
                  status={status}
                  submitStateCongress={submitStateCongress}
                  stateCongress={stateCongress}
                  setStateCongress={setStateCongress}
                  loadStateCongressEntry={loadStateCongressEntry}
                  stateCongressEntryId={stateCongressEntryId}
                  stateCongressRegions={stateCongressRegions}
                  stateCongressCentres={stateCongressCentres}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/state-congress-report/regions"
              element={
                <StateCongressRegionReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  stateCongressReportFilters={stateCongressReportFilters}
                  setStateCongressReportFilters={setStateCongressReportFilters}
                  stateCongressReportData={stateCongressReportData}
                  loadStateCongressRegionReport={loadStateCongressRegionReport}
                  stateCongressReportRegions={stateCongressReportRegions}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/state-congress-report/categories"
              element={
                <StateCongressCategoryReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  stateCongressCategoryFilters={stateCongressCategoryFilters}
                  setStateCongressCategoryFilters={setStateCongressCategoryFilters}
                  stateCongressCategoryData={stateCongressCategoryData}
                  loadStateCongressCategoryReport={loadStateCongressCategoryReport}
                  stateCongressCategoryRegions={stateCongressCategoryRegions}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/state-congress-report/membership"
              element={
                <StateCongressMembershipReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  stateCongressMembershipFilters={stateCongressMembershipFilters}
                  setStateCongressMembershipFilters={setStateCongressMembershipFilters}
                  stateCongressMembershipData={stateCongressMembershipData}
                  loadStateCongressMembershipReport={loadStateCongressMembershipReport}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/state-congress-report/institutions"
              element={
                <StateCongressInstitutionReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  stateCongressInstitutionFilters={stateCongressInstitutionFilters}
                  setStateCongressInstitutionFilters={setStateCongressInstitutionFilters}
                  stateCongressInstitutionData={stateCongressInstitutionData}
                  loadStateCongressInstitutionReport={loadStateCongressInstitutionReport}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/state-congress-report/clusters"
              element={
                <StateCongressClusterReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  stateCongressClusterFilters={stateCongressClusterFilters}
                  setStateCongressClusterFilters={setStateCongressClusterFilters}
                  stateCongressClusterData={stateCongressClusterData}
                  loadStateCongressClusterReport={loadStateCongressClusterReport}
                  clusters={stateCongressClusterReportClusters}
                  stateCongressSettings={stateCongressSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/zonal-congress-report/daily"
              element={
                <ZonalDailyReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  zonalDailyFilters={zonalDailyFilters}
                  setZonalDailyFilters={setZonalDailyFilters}
                  zonalDailyData={zonalDailyData}
                  loadZonalDailyReport={loadZonalDailyReport}
                  zonalSettings={zonalSettings}
                  states={states}
                />
              }
            />
            <Route
              path="/zonal-congress-report/membership"
              element={
                <ZonalMembershipReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  zonalMembershipFilters={zonalMembershipFilters}
                  setZonalMembershipFilters={setZonalMembershipFilters}
                  zonalMembershipData={zonalMembershipData}
                  loadZonalMembershipReport={loadZonalMembershipReport}
                  zonalSettings={zonalSettings}
                  states={states}
                />
              }
            />
            {/* AboutPage is handled in public shell check above, but route definition here is unreachable if isPublicPage catches it. 
                However, to avoid confusion or if isPublicPage logic changes, we can remove it or keep as fallback. 
                Removing it to be clean. */}
            <Route
              path="/retreat"
              element={
                <RetreatPage
                  clusters={retreatClusters}
                  status={status}
                  submitRetreat={submitRetreat}
                  retreat={retreat}
                  setRetreat={setRetreat}
                  loadRetreatEntry={loadRetreatEntry}
                  retreatEntryId={retreatEntryId}
                  retreatRegions={retreatRegions}
                  retreatCentres={retreatCentres}
                  states={states}
                />
              }
            />
            <Route
              path="/retreat-report"
              element={
                <RetreatReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  retreatReport={retreatReport}
                  setRetreatReport={setRetreatReport}
                  retreatReportRegions={retreatReportRegions}
                  retreatReportData={retreatReportData}
                  loadRetreatReport={loadRetreatReport}
                  clusters={retreatClusters}
                  states={states}
                />
              }
            />
            <Route
              path="/retreat-report/cluster-days"
              element={
                <RetreatClusterReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  retreatClusterFilters={retreatClusterFilters}
                  setRetreatClusterFilters={setRetreatClusterFilters}
                  retreatClusterData={retreatClusterData}
                  loadRetreatClusterReport={loadRetreatClusterReport}
                  clusters={retreatReportClusters}
                  retreatClusterRegions={retreatClusterRegions}
                  states={states}
                />
              }
            />
            <Route
              path="/retreat-report/centres"
              element={
                <RetreatCentreReportPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  retreatCentreFilters={retreatCentreFilters}
                  setRetreatCentreFilters={setRetreatCentreFilters}
                  retreatCentreData={retreatCentreData}
                  loadRetreatCentreReport={loadRetreatCentreReport}
                  states={states}
                  retreatCentreRegions={retreatCentreRegions}
                />
              }
            />
            <Route
              path="/profile"
              element={<ProfilePage user={user} />}
            />
            <Route
              path="/biodata"
              element={
                <BiodataPage
                  user={user}
                  canViewAdmin={canViewAdmin}
                  status={status}
                  submitBiodata={submitBiodata}
                  loadMyBiodata={loadMyBiodata}
                  biodataIsSelf={biodataIsSelf}
                  biodataEntryId={biodataEntryId}
                  setBiodataEntryId={setBiodataEntryId}
                  biodata={biodata}
                  setBiodata={setBiodata}
                  biodataRegions={biodataRegions}
                  biodataCentres={biodataCentres}
                  biodataClusters={biodataClusters}
                  workUnitsList={workUnitsList}
                  states={states}
                  institutions={institutions}
                />
              }
            />
            <Route
              path="/biodata-list"
              element={
                <BiodataListPage
                  user={user}
                  status={status}
                  loadBiodata={loadBiodata}
                  biodataFilters={biodataFilters}
                  setBiodataFilters={setBiodataFilters}
                  biodataFilterRegions={biodataFilterRegions}
                  biodataFilterCentres={biodataFilterCentres}
                  biodataData={biodataData}
                  states={states}
                  canManageBiodata={canManageBiodata}
                  onEditBiodata={loadBiodataEntry}
                  onDeleteBiodata={deleteBiodataEntry}
                />
              }
            />
            <Route path="/admin" element={<AdminPage {...adminPageProps} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
