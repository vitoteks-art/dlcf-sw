import { useState } from "react";
import { apiFetch, ensureCsrf } from "../api";

export default function PortalHome({
  states,
  stateSummaries,
  status,
  user,
  login,
  setLogin,
  handleLogin,
  submitAttendance,
  attendance,
  setAttendance,
  attendanceRegions,
  attendanceCentres,
  updateCount,
  total,
  attendanceEntryId,
  loadAttendanceEntry,
}) {
  return (
    <>
      <section className="portal-shell" id="portal">
        <header className="portal-header">
          <div>
            <p className="eyebrow">Attendance Portal</p>
            <h2>Weekly Attendance Submission</h2>
            <p className="lede">
              Record service attendance and generate summaries for states and regions.
            </p>
          </div>
          <div className="portal-summary">
            <div>
              <span className="portal-stat">{states.length}</span>
              <span className="portal-stat-label">States</span>
            </div>
            <div>
              <span className="portal-stat">
                {stateSummaries.reduce((sum, state) => sum + state.centres, 0)}
              </span>
              <span className="portal-stat-label">Fellowships</span>
            </div>
            <div>
              <span className="portal-stat">{total}</span>
              <span className="portal-stat-label">Latest Total</span>
            </div>
          </div>
        </header>

        {status ? <div className="status">{status}</div> : null}

        {!user ? (
          <AuthSection
            status={status}
            login={login}
            setLogin={setLogin}
            handleLogin={handleLogin}
          />
        ) : (
          <div className="portal-grid">
            <section className="card portal-card attendance-card">
              <div className="card-header">
                <div>
                  <h2>Attendance Entry</h2>
                  <p className="lede">Submit weekly attendance for a service.</p>
                  {attendanceEntryId ? (
                    <p className="small-text">
                      Editing an existing submission for this date and service.
                    </p>
                  ) : null}
                </div>
                <div className="total-pill">Total: {total}</div>
              </div>
              <form onSubmit={submitAttendance} className="form attendance-form">
                <div className="grid">
                  <label>
                    Date
                    <input
                      type="date"
                      value={attendance.entry_date}
                      onChange={(e) =>
                        setAttendance({ ...attendance, entry_date: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Service Day
                    <select
                      value={attendance.service_day}
                      onChange={(e) =>
                        setAttendance({ ...attendance, service_day: e.target.value })
                      }
                    >
                      <option value="monday_bs">Monday BS</option>
                      <option value="thursday_rh">Thursday RH</option>
                      <option value="sunday_ws">Sunday WS</option>
                      <option value="sunday_koinonia">Sunday Koinonia</option>
                    </select>
                  </label>
                  <label>
                    State
                    <select
                      value={attendance.state}
                      onChange={(e) =>
                        setAttendance({
                          ...attendance,
                          state: e.target.value,
                          region: "",
                          fellowship_centre: "",
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
                      value={attendance.region}
                      onChange={(e) =>
                        setAttendance({
                          ...attendance,
                          region: e.target.value,
                          fellowship_centre: "",
                        })
                      }
                      required
                      disabled={!attendance.state}
                    >
                      <option value="">Select region</option>
                      {attendanceRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Fellowship Centre
                    <select
                      value={attendance.fellowship_centre}
                      onChange={(e) =>
                        setAttendance({
                          ...attendance,
                          fellowship_centre: e.target.value,
                        })
                      }
                      required
                      disabled={!attendance.region}
                    >
                      <option value="">Select centre</option>
                      {attendanceCentres.map((centre) => (
                        <option key={centre} value={centre}>
                          {centre}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="counts">
                  {["adult", "youth", "children"].map((group) => (
                    <div key={group} className="count-group">
                      <h3>{group}</h3>
                      <label>
                        Male
                        <input
                          type="number"
                          min="0"
                          value={attendance.counts[group].male}
                          onChange={(e) => updateCount(group, "male", e.target.value)}
                        />
                      </label>
                      <label>
                        Female
                        <input
                          type="number"
                          min="0"
                          value={attendance.counts[group].female}
                          onChange={(e) =>
                            updateCount(group, "female", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="submit">
                    {attendanceEntryId ? "Update Attendance" : "Save Attendance"}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={loadAttendanceEntry}
                  >
                    Load Existing
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </>
  );
}

// ==================== AUTH SECTION COMPONENT ====================

function AuthSection({ status, login, setLogin, handleLogin }) {
  const [authView, setAuthView] = useState("login"); // login, signup, verify, forgot, reset
  const [authStatus, setAuthStatus] = useState("");
  const [signup, setSignup] = useState({ name: "", email: "", password: "" });
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetData, setResetData] = useState({ email: "", code: "", password: "" });

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthStatus("");
    try {
      await ensureCsrf();
      const data = await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify(signup),
      });
      setAuthStatus(data.message);
      setVerifyEmail(signup.email);
      setAuthView("verify");
    } catch (err) {
      setAuthStatus(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setAuthStatus("");
    try {
      await ensureCsrf();
      const data = await apiFetch("/verify-email", {
        method: "POST",
        body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
      });
      setAuthStatus(data.message);
      // Reload to get user state
      window.location.reload();
    } catch (err) {
      setAuthStatus(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthStatus("");
    try {
      await ensureCsrf();
      const data = await apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });
      setAuthStatus(data.message);
      setResetData({ ...resetData, email: forgotEmail });
      setAuthView("reset");
    } catch (err) {
      setAuthStatus(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthStatus("");
    try {
      await ensureCsrf();
      const data = await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify(resetData),
      });
      setAuthStatus(data.message);
      setAuthView("login");
    } catch (err) {
      setAuthStatus(err.message);
    }
  };

  return (
    <section id="portal" className="card">
      {(status || authStatus) && <div className="status">{authStatus || status}</div>}

      {authView === "login" && (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin} className="form">
            <label>
              Email
              <input
                type="email"
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                required
              />
            </label>
            <button type="submit">Sign in</button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--muted)" }}>
            Don't have an account?{" "}
            <button type="button" onClick={() => setAuthView("signup")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Sign up
            </button>
          </p>
          <p style={{ color: "var(--muted)" }}>
            <button type="button" onClick={() => setAuthView("forgot")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Forgot password?
            </button>
          </p>
        </>
      )}

      {authView === "signup" && (
        <>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup} className="form">
            <label>
              Full Name
              <input
                type="text"
                value={signup.name}
                onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={signup.email}
                onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={signup.password}
                onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                required
              />
            </label>
            <button type="submit">Create Account</button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--muted)" }}>
            Already have an account?{" "}
            <button type="button" onClick={() => setAuthView("login")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Sign in
            </button>
          </p>
        </>
      )}

      {authView === "verify" && (
        <>
          <h2>Verify Email</h2>
          <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
            A verification code was sent to <strong>{verifyEmail}</strong>. Enter it below:
          </p>
          <form onSubmit={handleVerify} className="form">
            <label>
              Verification Code
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </label>
            <button type="submit">Verify</button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--muted)" }}>
            <button type="button" onClick={() => setAuthView("login")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Back to login
            </button>
          </p>
        </>
      )}

      {authView === "forgot" && (
        <>
          <h2>Forgot Password</h2>
          <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
            Enter your email address and we'll send you a reset code.
          </p>
          <form onSubmit={handleForgotPassword} className="form">
            <label>
              Email
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit">Send Reset Code</button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--muted)" }}>
            <button type="button" onClick={() => setAuthView("login")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Back to login
            </button>
          </p>
        </>
      )}

      {authView === "reset" && (
        <>
          <h2>Reset Password</h2>
          <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
            Enter the code sent to your email and your new password.
          </p>
          <form onSubmit={handleResetPassword} className="form">
            <label>
              Email
              <input
                type="email"
                value={resetData.email}
                onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                required
              />
            </label>
            <label>
              Reset Code
              <input
                type="text"
                value={resetData.code}
                onChange={(e) => setResetData({ ...resetData, code: e.target.value })}
                placeholder="Enter 6-digit code"
                required
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={resetData.password}
                onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                required
              />
            </label>
            <button type="submit">Reset Password</button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--muted)" }}>
            <button type="button" onClick={() => setAuthView("login")} style={{ background: "transparent", color: "var(--accent-2)", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Back to login
            </button>
          </p>
        </>
      )}
    </section>
  );
}
