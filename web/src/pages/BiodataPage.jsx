import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BiodataPage({
  user,
  canViewAdmin,
  status,
  submitBiodata,
  loadMyBiodata,
  biodataIsSelf,
  biodataEntryId,
  setBiodataEntryId,
  biodata,
  setBiodata,
  biodataRegions,
  biodataCentres,
  biodataClusters,
  workUnitsList,
  states,
  institutions,
}) {
  const navigate = useNavigate();
  const [photoError, setPhotoError] = useState("");
  const emailMismatch =
    user?.email &&
    biodata.email &&
    user.email.toLowerCase() !== biodata.email.toLowerCase();

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoError("");
      setBiodata({ ...biodata, profile_photo: "" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoError("");
      setBiodata({ ...biodata, profile_photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (user && !biodataEntryId && !biodataIsSelf) {
      loadMyBiodata();
    }
  }, [biodataEntryId, biodataIsSelf, loadMyBiodata, user]);

  if (!user) {
    return null;
  }

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Biodata Form</p>
          <h2>Member Biodata Registration</h2>
          <p className="lede">
            Provide your personal and fellowship details for the directory.
          </p>
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <form onSubmit={submitBiodata} className="form biodata-form">
        <div className="grid">
          <label>
            Full Name
            <input
              type="text"
              value={biodata.full_name}
              onChange={(e) =>
                setBiodata({ ...biodata, full_name: e.target.value })
              }
              required
            />
          </label>
          <label className="full-span">
            Profile Photo
            <div className="photo-row">
              <div className="photo-preview">
                {biodata.profile_photo ? (
                  <img
                    src={biodata.profile_photo}
                    alt="Profile preview"
                  />
                ) : (
                  <span className="photo-placeholder">No photo</span>
                )}
              </div>
              <div className="photo-input">
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoError ? (
                  <span className="field-error">{photoError}</span>
                ) : null}
              </div>
            </div>
          </label>
          <label>
            Gender
            <select
              value={biodata.gender}
              onChange={(e) =>
                setBiodata({ ...biodata, gender: e.target.value })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label>
            Age
            <input
              type="number"
              min="1"
              value={biodata.age}
              onChange={(e) => setBiodata({ ...biodata, age: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              value={biodata.phone}
              onChange={(e) => setBiodata({ ...biodata, phone: e.target.value })}
              required
            />
          </label>
          <label>
            State
            <select
              value={biodata.state}
              onChange={(e) =>
                setBiodata({
                  ...biodata,
                  state: e.target.value,
                  region: "",
                  cluster: "",
                  fellowship_centre: "",
                  school: "",
                })
              }
              required
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select
              value={biodata.region}
              onChange={(e) =>
                setBiodata({
                  ...biodata,
                  region: e.target.value,
                  cluster: "",
                  fellowship_centre: "",
                })
              }
              required
              disabled={!biodata.state}
            >
              <option value="">Select region</option>
              {biodataRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cluster
            <select
              value={biodata.cluster}
              onChange={(e) =>
                setBiodata({
                  ...biodata,
                  cluster: e.target.value,
                })
              }
              disabled={!biodata.region}
            >
              <option value="">Select cluster</option>
              {biodataClusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fellowship Centre
            <select
              value={biodata.fellowship_centre}
              onChange={(e) =>
                setBiodata({ ...biodata, fellowship_centre: e.target.value })
              }
              required
              disabled={!biodata.region}
            >
              <option value="">Select centre</option>
              {biodataCentres.map((centre) => (
                <option key={centre} value={centre}>
                  {centre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Email
            <input
              type="email"
              value={biodata.email}
              onChange={(e) => setBiodata({ ...biodata, email: e.target.value })}
              required
            />
            {emailMismatch ? (
              <span className="field-error">
                Email must match your account email.
              </span>
            ) : null}
          </label>
          <label>
            School
            <select
              value={biodata.school}
              onChange={(e) => setBiodata({ ...biodata, school: e.target.value })}
              required
              disabled={!biodata.state}
            >
              <option value="">Select institution</option>
              {institutions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={biodata.category}
              onChange={(e) =>
                setBiodata({ ...biodata, category: e.target.value })
              }
              required
            >
              <option value="">Select category</option>
              <option value="Staff">Staff</option>
              <option value="Corper">Corper</option>
              <option value="Student">Student</option>
              <option value="Youth">Youth</option>
              <option value="Children">Children</option>
            </select>
          </label>
          <label>
            Worker Status
            <select
              value={biodata.worker_status}
              onChange={(e) =>
                setBiodata({ ...biodata, worker_status: e.target.value })
              }
            >
              <option value="Member">Member</option>
              <option value="Worker">Worker</option>
              <option value="Associate Coord">Associate Coord</option>
              <option value="Guest">Guest</option>
            </select>
          </label>
          <label className="full-span">
            Work Units
            <div className="checkbox-grid">
              {workUnitsList.length === 0 ? (
                <span>No work units available yet.</span>
              ) : (
                workUnitsList.map((unit) => (
                  <label key={unit} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={biodata.work_units.includes(unit)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBiodata((prev) => ({
                          ...prev,
                          work_units: checked
                            ? [...prev.work_units, unit]
                            : prev.work_units.filter((item) => item !== unit),
                        }));
                      }}
                    />
                    <span>{unit}</span>
                  </label>
                ))
              )}
            </div>
          </label>
          <label>
            Membership Status
            <select
              value={biodata.membership_status}
              onChange={(e) =>
                setBiodata({ ...biodata, membership_status: e.target.value })
              }
            >
              <option value="Member">Member</option>
              <option value="Worker">Worker</option>
              <option value="Associate Coord">Associate Coord</option>
              <option value="Guest">Guest</option>
            </select>
          </label>
          <label>
            Address
            <input
              type="text"
              value={biodata.address}
              onChange={(e) => setBiodata({ ...biodata, address: e.target.value })}
              required
            />
          </label>
          <label>
            Next of Kin Name
            <input
              type="text"
              value={biodata.next_of_kin_name}
              onChange={(e) =>
                setBiodata({ ...biodata, next_of_kin_name: e.target.value })
              }
              required
            />
          </label>
          <label>
            Next of Kin Phone
            <input
              type="text"
              value={biodata.next_of_kin_phone}
              onChange={(e) =>
                setBiodata({ ...biodata, next_of_kin_phone: e.target.value })
              }
              required
            />
          </label>
          <label>
            Next of Kin Relationship
            <input
              type="text"
              value={biodata.next_of_kin_relationship}
              onChange={(e) =>
                setBiodata({
                  ...biodata,
                  next_of_kin_relationship: e.target.value,
                })
              }
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={emailMismatch}>
            {biodataEntryId || biodataIsSelf ? "Update Biodata" : "Submit Biodata"}
          </button>
          {biodataEntryId ? (
            <button
              type="button"
              className="btn-outline"
              onClick={() => setBiodataEntryId("")}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
