import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

const createEmptyCounts = () => ({
  adult: { male: 0, female: 0 },
  youth: { male: 0, female: 0 },
  children: { male: 0, female: 0 },
});

export default function GckPage({
  user,
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
        { label: "", period: "", date: "", counts: createEmptyCounts() },
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
            },
          },
        };
      }),
    }));
  };

  const sessionTotal = (session) => {
    const counts = session.counts || createEmptyCounts();
    return (
      counts.adult.male +
      counts.adult.female +
      counts.youth.male +
      counts.youth.female +
      counts.children.male +
      counts.children.female
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

      <form onSubmit={submitGckReport} className="form">
        <div className="grid">
          <label>
            Report Month
            <input
              type="month"
              value={gckReport.report_month}
              onChange={(e) =>
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
                setGckReport({
                  ...gckReport,
                  state: e.target.value,
                  region: "",
                  fellowship_centre: "",
                })
              }
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
                setGckReport({
                  ...gckReport,
                  region: e.target.value,
                  fellowship_centre: "",
                })
              }
              disabled={!gckReport.state}
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
                setGckReport({
                  ...gckReport,
                  fellowship_centre: e.target.value,
                })
              }
              disabled={!gckReport.region}
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
          <h3>Sessions / Days</h3>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={addSession}>
              Add Day
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
              No sessions added yet. Click “Add Day” to start.
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
                    Session
                    <select
                      value={session.period || ""}
                      onChange={(e) =>
                        updateSessionField(index, "period", e.target.value)
                      }
                    >
                      <option value="">Select session</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
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
                          value={session.counts?.[group]?.male ?? 0}
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
                          value={session.counts?.[group]?.female ?? 0}
                          onChange={(e) =>
                            updateSessionCount(index, group, "female", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
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
    </section>
  );
}
