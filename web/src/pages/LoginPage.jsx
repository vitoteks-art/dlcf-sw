import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ensureCsrf } from "../api";

export default function LoginPage({ login, setLogin, handleLogin, status, states }) {
    const [authView, setAuthView] = useState("login"); // login, signup, verify, forgot, reset
    const [authStatus, setAuthStatus] = useState("");
    const [signup, setSignup] = useState({ name: "", email: "", password: "", state: "", region: "", fellowship_centre: "" });
    const [signupRegions, setSignupRegions] = useState([]);
    const [signupCentres, setSignupCentres] = useState([]);
    const [verifyEmail, setVerifyEmail] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetData, setResetData] = useState({ email: "", code: "", password: "" });

    useEffect(() => {
        if (!signup.state) {
            setSignupRegions([]);
            setSignup(prev => ({ ...prev, region: "", fellowship_centre: "" }));
            return;
        }
        apiFetch(`/meta/regions?state=${encodeURIComponent(signup.state)}`)
            .then(data => setSignupRegions(data.items || []))
            .catch(() => setSignupRegions([]));
    }, [signup.state]);

    useEffect(() => {
        if (!signup.state || !signup.region) {
            setSignupCentres([]);
            setSignup(prev => ({ ...prev, fellowship_centre: "" }));
            return;
        }
        apiFetch(`/meta/fellowships?state=${encodeURIComponent(signup.state)}&region=${encodeURIComponent(signup.region)}`)
            .then(data => setSignupCentres(data.items || []))
            .catch(() => setSignupCentres([]));
    }, [signup.state, signup.region]);

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
        <div className="login-page">
            <div className="login-container">
                <div className="login-brand">
                    <img src="/logo.png" alt="DLCF" className="login-logo" />
                    <h1>Deeper Life Campus Fellowship</h1>
                    <p>South West Zone Portal</p>
                </div>

                <div className="login-card">
                    {(status || authStatus) && <div className="status">{authStatus || status}</div>}

                    {authView === "login" && (
                        <>
                            <h2>Welcome Back</h2>
                            <p className="login-subtitle">Sign in to continue to the portal</p>
                            <form onSubmit={handleLogin} className="form">
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        value={login.email}
                                        onChange={(e) => setLogin({ ...login, email: e.target.value })}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </label>
                                <label>
                                    Password
                                    <input
                                        type="password"
                                        value={login.password}
                                        onChange={(e) => setLogin({ ...login, password: e.target.value })}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </label>
                                <button type="submit">Sign in</button>
                            </form>
                            <div className="login-links">
                                <p>
                                    Don't have an account?{" "}
                                    <button type="button" onClick={() => setAuthView("signup")} className="link-btn">
                                        Sign up
                                    </button>
                                </p>
                                <p>
                                    <button type="button" onClick={() => setAuthView("forgot")} className="link-btn">
                                        Forgot password?
                                    </button>
                                </p>
                            </div>
                        </>
                    )}

                    {authView === "signup" && (
                        <>
                            <h2>Create Account</h2>
                            <p className="login-subtitle">Join the fellowship portal</p>
                            <form onSubmit={handleSignup} className="form">
                                <label>
                                    Full Name
                                    <input
                                        type="text"
                                        value={signup.name}
                                        onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </label>
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        value={signup.email}
                                        onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </label>
                                <label>
                                    Password
                                    <input
                                        type="password"
                                        value={signup.password}
                                        onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                                        placeholder="Create a password"
                                        required
                                    />
                                </label>
                                <label>
                                    State
                                    <select
                                        value={signup.state}
                                        onChange={(e) => setSignup({ ...signup, state: e.target.value, region: "", fellowship_centre: "" })}
                                        required
                                    >
                                        <option value="">Select state</option>
                                        {(states || []).map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Region
                                    <select
                                        value={signup.region}
                                        onChange={(e) => setSignup({ ...signup, region: e.target.value, fellowship_centre: "" })}
                                        required
                                        disabled={!signup.state}
                                    >
                                        <option value="">Select region</option>
                                        {signupRegions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Fellowship Centre
                                    <select
                                        value={signup.fellowship_centre}
                                        onChange={(e) => setSignup({ ...signup, fellowship_centre: e.target.value })}
                                        disabled={!signup.region}
                                    >
                                        <option value="">Select centre (optional)</option>
                                        {signupCentres.map((centre) => (
                                            <option key={centre} value={centre}>{centre}</option>
                                        ))}
                                    </select>
                                </label>
                                <button type="submit">Create Account</button>
                            </form>
                            <div className="login-links">
                                <p>
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => setAuthView("login")} className="link-btn">
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </>
                    )}

                    {authView === "verify" && (
                        <>
                            <h2>Verify Email</h2>
                            <p className="login-subtitle">
                                A verification code was sent to <strong>{verifyEmail}</strong>
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
                            <div className="login-links">
                                <button type="button" onClick={() => setAuthView("login")} className="link-btn">
                                    Back to login
                                </button>
                            </div>
                        </>
                    )}

                    {authView === "forgot" && (
                        <>
                            <h2>Forgot Password</h2>
                            <p className="login-subtitle">Enter your email to receive a reset code</p>
                            <form onSubmit={handleForgotPassword} className="form">
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </label>
                                <button type="submit">Send Reset Code</button>
                            </form>
                            <div className="login-links">
                                <button type="button" onClick={() => setAuthView("login")} className="link-btn">
                                    Back to login
                                </button>
                            </div>
                        </>
                    )}

                    {authView === "reset" && (
                        <>
                            <h2>Reset Password</h2>
                            <p className="login-subtitle">Enter the code and your new password</p>
                            <form onSubmit={handleResetPassword} className="form">
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        value={resetData.email}
                                        onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                                        placeholder="Enter your email"
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
                                        placeholder="Create new password"
                                        required
                                    />
                                </label>
                                <button type="submit">Reset Password</button>
                            </form>
                            <div className="login-links">
                                <button type="button" onClick={() => setAuthView("login")} className="link-btn">
                                    Back to login
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="login-footer">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
