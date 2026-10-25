import { useMemo, useState } from "react";
import { RalphWorldScene } from "./game-scene";

const countryCatalog = [
  { id: "aurora", name: "Aurora City", city: "Neon Harbor", flag: "🇨🇦", description: "Pacific coast startup hub", spawn: [0, 0.5, 0] as [number, number, number] },
  { id: "atlas", name: "Atlas Prime", city: "Skyline Ridge", flag: "🇺🇸", description: "Aerospace and finance district", spawn: [2, 0.5, -2] as [number, number, number] },
  { id: "sundown", name: "Sundown Bay", city: "Golden Dunes", flag: "🇦🇺", description: "Tourism and desert highway network", spawn: [-3, 0.5, 4] as [number, number, number] },
  { id: "ivory", name: "Ivory Coast", city: "Luma Port", flag: "🇳🇬", description: "Trade and industrial exports", spawn: [5, 0.5, 2] as [number, number, number] },
];

const missions = [
  { id: "pickup", title: "Courier Run", detail: "Deliver the package to the city marker.", reward: 250, position: [-12, 0, -8] as [number, number, number] },
  { id: "rescue", title: "Street Rescue", detail: "Respond to the emergency signal in downtown.", reward: 420, position: [12, 0, 8] as [number, number, number] },
];

const appCatalog = [
  { id: "contacts", icon: "👥", name: "Contacts" },
  { id: "messages", icon: "💬", name: "Messages" },
  { id: "camera", icon: "📷", name: "Camera" },
  { id: "photos", icon: "🖼️", name: "Photos" },
  { id: "ralphtok", icon: "🎵", name: "Ralphtok" },
  { id: "map", icon: "🗺️", name: "Map" },
  { id: "bank", icon: "🏦", name: "Bank" },
  { id: "jobs", icon: "💼", name: "Jobs" },
  { id: "settings", icon: "⚙️", name: "Settings" },
];

const phoneNotifications = [
  "A new mission is active.",
  "A friend sent a voice note.",
  "An apartment payment is due.",
  "Ralphtok trending: #moonrise",
];

export function RalphWorldApp() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authenticated, setAuthenticated] = useState(false);
  const [countryPhase, setCountryPhase] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCatalog[0]);
  const [username, setUsername] = useState("RalphPilot");
  const [money, setMoney] = useState(3200);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(appCatalog[0].id);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: true });
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "", confirm: "", dob: "", country: "Canada", character: "Astra", agree: false });

  const activeMission = useMemo(() => missions.find((mission) => !missionCompleted) ?? missions[0], [missionCompleted]);

  const handleAuthSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (authMode === "signup") {
      if (!signupForm.username || !signupForm.email || !signupForm.password || !signupForm.confirm || !signupForm.agree) {
        return;
      }
      setUsername(signupForm.username.trim() || "RalphPilot");
      setAuthenticated(true);
      setCountryPhase(true);
      return;
    }

    if (!loginForm.email || !loginForm.password) {
      return;
    }

    setAuthenticated(true);
    setCountryPhase(true);
  };

  const handleMissionComplete = () => {
    if (!missionCompleted) {
      setMissionCompleted(true);
      setMoney((prev) => prev + activeMission.reward);
    }
  };

  if (!authenticated) {
    return (
      <div className="ralph-world-shell">
        <div className="auth-screen">
          <div className="auth-card">
            <div className="brand">
              <h1>RALPH WORLD</h1>
              <p>Open-world multiplayer</p>
            </div>

            <div className="auth-toggle">
              <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">
                Login
              </button>
              <button className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")} type="button">
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="form-grid">
              {authMode === "signup" ? (
                <>
                  <div className="input-group">
                    <label>Username</label>
                    <input value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Password</label>
                      <input type="password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Confirm password</label>
                      <input type="password" value={signupForm.confirm} onChange={(e) => setSignupForm({ ...signupForm, confirm: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Date of birth</label>
                      <input type="date" value={signupForm.dob} onChange={(e) => setSignupForm({ ...signupForm, dob: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Country</label>
                      <select value={signupForm.country} onChange={(e) => setSignupForm({ ...signupForm, country: e.target.value })}>
                        <option>Canada</option>
                        <option>United States</option>
                        <option>Australia</option>
                        <option>Nigeria</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Character preference</label>
                    <select value={signupForm.character} onChange={(e) => setSignupForm({ ...signupForm, character: e.target.value })}>
                      <option>Astra</option>
                      <option>Nyx</option>
                      <option>Juno</option>
                    </select>
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={signupForm.agree} onChange={(e) => setSignupForm({ ...signupForm, agree: e.target.checked })} />
                    I agree to the Terms and Privacy Policy.
                  </label>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Email or Username</label>
                    <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={loginForm.remember} onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })} />
                    Remember this device
                  </label>
                </>
              )}

              <div className="auth-actions">
                <button className="primary-button" type="submit">
                  {authMode === "login" ? "Login" : "Create Account"}
                </button>
                {authMode === "login" && <button className="ghost-button" type="button">Forgot password</button>}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (countryPhase && !authenticated) {
    return null;
  }

  if (countryPhase) {
    return (
      <div className="country-select-screen">
        <div className="country-card">
          <div className="country-header">
            <h2>Choose your starting country</h2>
            <button className="primary-button" style={{ padding: "12px 16px" }} onClick={() => setCountryPhase(false)} type="button">
              Enter Ralph World
            </button>
          </div>

          <div className="country-grid">
            {countryCatalog.map((country) => (
              <button
                key={country.id}
                type="button"
                className={`country-tile ${selectedCountry.id === country.id ? "selected" : ""}`}
                onClick={() => setSelectedCountry(country)}
                style={{ textAlign: "left" }}
              >
                <div className="country-flag">{country.flag}</div>
                <div className="country-name">{country.name}</div>
                <div className="country-meta">{country.city}</div>
                <div className="note">{country.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell">
      <RalphWorldScene
        country={selectedCountry}
        username={username}
        onMissionComplete={handleMissionComplete}
        isMissionCompleted={missionCompleted}
      />

      <div className="hud">
        <div className="hud-top">
          <div className="player-box">
            <strong>{username}</strong>
            <span>{selectedCountry.flag} {selectedCountry.city}</span>
          </div>

          <div className="quick-stats">
            <div className="stat-pill">
              <strong>${money}</strong>
              <span>Cash</span>
            </div>
            <div className="stat-pill">
              <strong>{missionCompleted ? "Done" : "Live"}</strong>
              <span>Mission</span>
            </div>
            <div className="stat-pill">
              <strong>72%</strong>
              <span>Profile</span>
            </div>
          </div>

          <div className="mission-box">
            <h4>Current mission</h4>
            <div className="mission-status">{activeMission.title}</div>
            <span>{activeMission.detail}</span>
          </div>
        </div>
      </div>

      <button className="map-toggle" type="button" onClick={() => setMapOpen((prev) => !prev)}>
        Map
      </button>
      <button className="phone-toggle" type="button" onClick={() => setPhoneOpen((prev) => !prev)}>
        Phone
      </button>

      {phoneOpen && (
        <div className="phone-panel">
          <div className="phone-header">
            <strong>Ralph Phone</strong>
            <span className="phone-status">9:41 AM • 80% • 5G</span>
          </div>
          <div className="phone-body">
            <div className="app-grid">
              {appCatalog.map((app) => (
                <button
                  key={app.id}
                  className="app-tile"
                  type="button"
                  onClick={() => setSelectedApp(app.id)}
                  aria-label={app.name}
                >
                  <div className="app-icon">{app.icon}</div>
                  <div>{app.name}</div>
                </button>
              ))}
            </div>

            <div className="app-rows">
              <div className="phone-action-row">
                <span>Selected App</span>
                <strong>{appCatalog.find((app) => app.id === selectedApp)?.name ?? "Contacts"}</strong>
              </div>
              <div className="phone-action-row">
                <span>Notifications</span>
                <strong>{phoneNotifications.length}</strong>
              </div>
              <div className="phone-action-row">
                <span>Last message</span>
                <strong>“Let’s go to the Moon.”</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {mapOpen && (
        <div className="panel">
          <div className="panel-header">
            <h3>Map</h3>
            <button className="small-button" type="button" onClick={() => setMapOpen(false)}>Close</button>
          </div>
          <div className="panel-body">
            <div className="map-grid">
              <div className="map-surface" aria-label="World map" />
              <div className="poi-list">
                <div className="poi-item">
                  <div>
                    <div className="tag">Mission</div>
                    <strong>Courier Run</strong>
                  </div>
                  <button className="small-button" type="button">Route</button>
                </div>
                <div className="poi-item">
                  <div>
                    <div className="tag">Jobs</div>
                    <strong>Taxi Network</strong>
                  </div>
                  <button className="small-button" type="button">View</button>
                </div>
                <div className="poi-item">
                  <div>
                    <div className="tag">Bank</div>
                    <strong>Metro Savings</strong>
                  </div>
                  <button className="small-button" type="button">Open</button>
                </div>
                <div className="poi-item">
                  <div>
                    <div className="tag">Spaceport</div>
                    <strong>Moon Launch</strong>
                  </div>
                  <button className="small-button" type="button">Travel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
