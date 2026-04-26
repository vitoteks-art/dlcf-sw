import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import FollowupContactRepeater from "../components/FollowupContactRepeater";

const createEmptyCounts = () => ({
  adult: { male: "", female: "" },
  youth: { male: "", female: "" },
  children: { male: "", female: "" },
});

const programOptions = [
  "Crusade Sessions",
  "Ministers’ Conferences",
  "Impact Academy",
  "Sunday Worship Service / SHS",
];

export default function GckPage({
  user,
  canSubmitDirectly,
  attendanceAccess,
  attendanceCode,
  setAttendanceCode,
  activateAttendanceCode,
  clearAttendanceAccess,
  status,
  gckReport,
  setGckReport,
  gckRegions,
  gckCentres,
  submitGckReport,
  gckEntryId,
  loadGckReport,
  states,
}) {
  const navigate = useNavigate();
  const isCodeAuthorized = !canSubmitDirectly && attendanceAccess?.authorized;

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const addSession = () => {
    setGckReport((prev) => ({
        ...prev,
        sessions: [
          ...prev.sessions,
        { label: "", program: "", date: "", counts: createEmptyCounts(), followup_contacts: [] },
      ],
    }));
  };

  const removeSession = (index) => {
    setGckReport((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, idx) => idx !== index),
    }));
  };

  const updateSessionField = (index, field, value) => {
    setGckReport((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session, idx) =>
        idx === index ? { ...session, [field]: value } : session
      ),
    }));
  };

  const updateSessionCount = (index, group, gender, value) => {
    setGckReport((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session, idx) => {
        if (idx !== index) return session;
        const counts = session.counts || createEmptyCounts();
        return {
          ...session,
          counts: {
            ...counts,
            [group]: {
              ...counts[group],
              [gender]: Number(value) || 0,
              [gender]: value,
            },
          },
        };
      }),
    }));
  };

  const sessionTotal = (session) => {
    const counts = session.counts || createEmptyCounts();
    return (
      (Number(counts.adult.male) || 0) +
      (Number(counts.adult.female) || 0) +
      (Number(counts.youth.male) || 0) +
      (Number(counts.youth.female) || 0) +
      (Number(counts.children.male) || 0) +
      (Number(counts.children.female) || 0)
    );
  };

  return (
    <section className="card retreat-page">
      <SEO
        title="GCK Attendance"
        description="Global Crusade with Kumuyi (GCK) Attendance Reporting Portal."
      />
      <div className="retreat-head">
        <div>
          <p className="eyebrow">GCK Attendance</p>
          <h2>Global Crusade Attendance Report</h2>
          <p className="lede">Submit the monthly GCK attendance by day.</p>
          {gckEntryId ? (
            <p className="small-text">
              Editing an existing report for this month.
            </p>
          ) : null}
        </div>
        <Link className="ghost" to="/">
          Back to Home
        </Link>
      </div>

      {status ? <div className="status">{status}</div> : null}

      {!canSubmitDirectly && !attendanceAccess?.authorized ? (
        <form onSubmit={activateAttendanceCode} className="form compact-form" style={{ marginBottom: 16 }}>
          <label>
            Attendance Access Code
            <input
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              placeholder="Enter access code"
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit">Continue</button>
          </div>
        </form>
      ) : null}

      {!canSubmitDirectly && attendanceAccess?.authorized ? (
        <div className="status" style={{ marginBottom: 16 }}>
          GCK access granted for {attendanceAccess?.session?.fellowship_centre}, {attendanceAccess?.session?.state}, {attendanceAccess?.session?.region}.
          <div style={{ marginTop: 8 }}>
            <button type="button" className="btn-outline" onClick={clearAttendanceAccess}>
              Exit Access
            </button>
          </div>
        </div>
      ) : null}

      {canSubmitDirectly || isCodeAuthorized ? (
      <form onSubmit={submitGckReport} className="form">
        <div className="grid">
          <label>
            Report Month
            <input
              type="month"
              value={gckReport.report_month}
              onChange={(e) =>
                isCodeAuthorized
                  ? null
                  :
                setGckReport({ ...gckReport, report_month: e.target.value })
              }
              required
            />
          </label>
          <label>
            State
            <select
              value={gckReport.state}
              onChange={(e) =>
                isCodeAuthorized
                  ? null
                  :
                setGckReport({
                  ...gckReport,
                  state: e.target.value,
                  region: "",
                  fellowship_centre: "",
                })
              }
              disabled={isCodeAuthorized}
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
              value={gckReport.region}
              onChange={(e) =>
                isCodeAuthorized
                  ? null
                  :
                setGckReport({
                  ...gckReport,
                  region: e.target.value,
                  fellowship_centre: "",
                })
              }
              disabled={isCodeAuthorized || !gckReport.state}
            >
              <option value="">Select region</option>
              {gckRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fellowship Centre
            <select
              value={gckReport.fellowship_centre}
              onChange={(e) =>
                isCodeAuthorized
                  ? null
                  :
                setGckReport({
                  ...gckReport,
                  fellowship_centre: e.target.value,
                })
              }
              disabled={isCodeAuthorized || !gckReport.region}
            >
              <option value="">Select centre</option>
              {gckCentres.map((centre) => (
                <option key={centre} value={centre}>
                  {centre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="gck-session-header">
          <h3>Programs / Days</h3>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={addSession}>
              Add Program Entry
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={loadGckReport}
            >
              Load Existing
            </button>
          </div>
        </div>

        <div className="gck-sessions">
          {gckReport.sessions.length === 0 ? (
            <p className="small-text">
              No program entries added yet. Click “Add Program Entry” to start.
            </p>
          ) : (
            gckReport.sessions.map((session, index) => (
              <div className="gck-session-card" key={`gck-session-${index}`}>
                <div className="gck-session-meta">
                  <label>
                    Day Label
                    <input
                      type="text"
                      value={session.label || ""}
                      onChange={(e) =>
                        updateSessionField(index, "label", e.target.value)
                      }
                      placeholder="Day 1 / February Edition"
                      required
                    />
                  </label>
                  <label>
                    Program
                    <select
                      value={session.program || ""}
                      onChange={(e) =>
                        updateSessionField(index, "program", e.target.value)
                      }
                      required
                    >
                      <option value="">Select program</option>
                      {programOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      value={session.date || ""}
                      onChange={(e) =>
                        updateSessionField(index, "date", e.target.value)
                      }
                      required
                    />
                  </label>
                  <div className="total-pill">Total: {sessionTotal(session)}</div>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => removeSession(index)}
                  >
                    Remove
                  </button>
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
                          value={session.counts?.[group]?.male ?? ""}
                          onChange={(e) =>
                            updateSessionCount(index, group, "male", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Female
                        <input
                          type="number"
                          min="0"
                          value={session.counts?.[group]?.female ?? ""}
                          onChange={(e) =>
                            updateSessionCount(index, group, "female", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <FollowupContactRepeater
                  contacts={session.followup_contacts || []}
                  onChange={(contacts) => updateSessionField(index, "followup_contacts", contacts)}
                  title="Visitors / Converts follow-up details"
                  helper="Capture people who need follow-up after this program. They will appear in the Follow-up dashboard."
                  showCountWarning={false}
                />
              </div>
            ))
          )}
        </div>

        <div className="form-actions">
          <button type="submit">
            {gckEntryId ? "Update GCK Report" : "Submit GCK Report"}
          </button>
        </div>
      </form>
      ) : null}
    </section>
  );
}
