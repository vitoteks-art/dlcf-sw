import { useEffect, useState } from "react";
import { apiFetch } from "../../api";

const emptySettings = {
  enabled: false,
  base_url: "",
  instance_name: "",
  instance_key: "",
  send_endpoint_path: "/message/sendText/{instance_name}",
  default_country_code: "234",
  has_api_token: false,
  api_token_masked: null,
  source: "database",
};

export default function AdminIntegrationSettings() {
  const [settings, setSettings] = useState(emptySettings);
  const [tokenReplacement, setTokenReplacement] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("DLCF South West Evolution API test message.");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/integration-settings/evolution-api");
      setSettings({ ...emptySettings, ...(data.settings || {}) });
      setClearToken(false);
      setTokenReplacement("");
    } catch (err) {
      setStatus(err.message || "Failed to load integration settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        enabled: !!settings.enabled,
        base_url: settings.base_url,
        instance_name: settings.instance_name,
        instance_key: settings.instance_key,
        send_endpoint_path: settings.send_endpoint_path,
        default_country_code: settings.default_country_code,
        clear_api_token: clearToken,
      };
      if (tokenReplacement.trim()) payload.api_token = tokenReplacement.trim();
      const data = await apiFetch("/admin/integration-settings/evolution-api", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSettings({ ...emptySettings, ...(data.settings || {}) });
      setTokenReplacement("");
      setClearToken(false);
      setStatus(data.message || "Settings saved");
    } catch (err) {
      setStatus(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatus("");
    try {
      const data = await apiFetch("/admin/integration-settings/evolution-api/test-whatsapp", {
        method: "POST",
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      });
      const result = data.result || {};
      setStatus(result.ok ? `Test sent to ${result.number || testPhone}` : `Test failed: ${result.error || "Provider rejected the message"}`);
    } catch (err) {
      setStatus(err.message || "Failed to send test WhatsApp");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <p>Loading integration settings…</p>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Integration Settings</h3>
        <p className="small-text">Super Admin-only controls for Evolution API WhatsApp delivery.</p>
      </div>

      {status ? <div className="status">{status}</div> : null}

      <form className="form-grid" onSubmit={saveSettings}>
        <label className="checkbox-row">
          <input type="checkbox" checked={!!settings.enabled} onChange={(e) => update("enabled", e.target.checked)} />
          Enable Evolution API WhatsApp sending
        </label>
        <label>Base URL<input value={settings.base_url || ""} onChange={(e) => update("base_url", e.target.value)} placeholder="https://evolution.example.com" /></label>
        <label>Instance Name<input value={settings.instance_name || ""} onChange={(e) => update("instance_name", e.target.value)} placeholder="dlcf-sw" /></label>
        <label>Instance Key<input value={settings.instance_key || ""} onChange={(e) => update("instance_key", e.target.value)} placeholder="Optional provider instance key" /></label>
        <label>Send Endpoint Path<input value={settings.send_endpoint_path || ""} onChange={(e) => update("send_endpoint_path", e.target.value)} placeholder="/message/sendText/{instance_name}" /></label>
        <label>Default Country Code<input value={settings.default_country_code || "234"} onChange={(e) => update("default_country_code", e.target.value)} placeholder="234" /></label>
        <label>
          API Key / Token
          <input value={settings.api_token_masked || "Not configured"} readOnly aria-label="Masked API token" />
          <span className="small-text">Raw token is never displayed.</span>
        </label>
        <label>
          Replace API Key / Token
          <input type="password" value={tokenReplacement} onChange={(e) => setTokenReplacement(e.target.value)} placeholder="Paste a new token to replace" autoComplete="new-password" />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={clearToken} onChange={(e) => setClearToken(e.target.checked)} />
          Clear saved API token
        </label>
        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Evolution API Settings"}</button>
          <button type="button" className="btn-outline" onClick={loadSettings}>Reload</button>
        </div>
        <p className="small-text">Source: {settings.source || "database"}. Endpoint supports placeholders: {"{instance_name}"}, {"{instance_key}"}, or {"{instance}"}.</p>
      </form>

      <form className="form-grid" onSubmit={sendTest} style={{ marginTop: 24 }}>
        <h4>Test WhatsApp Send</h4>
        <label>Recipient Phone<input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="080... or 234..." /></label>
        <label>Message<textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} rows={3} /></label>
        <div className="form-actions"><button type="submit" disabled={testing}>{testing ? "Sending…" : "Send Test WhatsApp"}</button></div>
      </form>
    </div>
  );
}
