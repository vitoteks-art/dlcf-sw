import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    apiFetch("/biodata/me")
      .then((data) => {
        setProfile(data.item || null);
        setStatus("");
      })
      .catch((err) => {
        if (err.message === "Not found") {
          setProfile(null);
          setStatus("No biodata yet. Please complete your profile.");
        } else {
          setStatus(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <section className="card retreat-page profile-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>My Dashboard</h2>
          <p className="lede">Review your biodata and program participation.</p>
        </div>
        <Link className="btn-outline profile-edit" to="/biodata">
          Edit Profile
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <>
          <div className="profile-card">
            <div className="profile-photo">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.full_name} />
              ) : (
                <span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
              )}
            </div>
            <div>
              <h3>{profile?.full_name || user.name}</h3>
              <p className="muted">{user.email}</p>
              <div className="profile-tags">
                <span>{user.role}</span>
                {profile?.state ? <span>{profile.state}</span> : null}
                {profile?.region ? <span>{profile.region}</span> : null}
              </div>
            </div>
          </div>

          {profile ? (
            <div className="profile-section">
              <h4>Biodata</h4>
              <div className="details-grid">
                <div>
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{profile.phone}</span>
                </div>
                <div>
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{profile.gender}</span>
                </div>
                <div>
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{profile.age}</span>
                </div>
                <div>
                  <span className="detail-label">School</span>
                  <span className="detail-value">{profile.school}</span>
                </div>
                <div>
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{profile.category}</span>
                </div>
                <div>
                  <span className="detail-label">Worker Status</span>
                  <span className="detail-value">{profile.worker_status}</span>
                </div>
                <div>
                  <span className="detail-label">Membership</span>
                  <span className="detail-value">{profile.membership_status}</span>
                </div>
                <div>
                  <span className="detail-label">Cluster</span>
                  <span className="detail-value">{profile.cluster}</span>
                </div>
                <div>
                  <span className="detail-label">Work Units</span>
                  <span className="detail-value">
                    {(profile.work_units || []).join(", ")}
                  </span>
                </div>
                <div>
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{profile.address}</span>
                </div>
                <div>
                  <span className="detail-label">Next of Kin</span>
                  <span className="detail-value">{profile.next_of_kin_name}</span>
                </div>
                <div>
                  <span className="detail-label">Next of Kin Phone</span>
                  <span className="detail-value">{profile.next_of_kin_phone}</span>
                </div>
                <div>
                  <span className="detail-label">Relationship</span>
                  <span className="detail-value">
                    {profile.next_of_kin_relationship}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="profile-section">
            <h4>Programs</h4>
            <div className="profile-programs">
              <div className="program-card">
                <h5>Attendance</h5>
                <p>Track your weekly reports and submissions.</p>
              </div>
              <div className="program-card">
                <h5>Retreat</h5>
                <p>View registration history and updates.</p>
              </div>
              <div className="program-card">
                <h5>GCK</h5>
                <p>Monitor monthly crusade participation.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
