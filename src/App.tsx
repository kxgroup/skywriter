import { useEffect, useState } from "react";
import { useApp } from "./context/AppContext";
import BootSequence from "./components/BootSequence";
import Walkthrough from "./components/Walkthrough";
import ProfileManager from "./components/ProfileManager";
import PressReleaseStudio from "./components/PressReleaseStudio";
import VisualAssetEngine from "./components/VisualAssetEngine";
import Timeline from "./components/Timeline";
import Manual from "./components/Manual";
import Settings from "./components/Settings";
import { exportProfiles, exportProjectSource } from "./lib/storage";
import { loadConfig, textProviderReady } from "./lib/config";

type Tab = "profiles" | "press" | "visual" | "manual";

const TABS: { id: Tab; label: string }[] = [
  { id: "profiles", label: "Profiles" },
  { id: "press", label: "Press Releases" },
  { id: "visual", label: "Visual Assets" },
  { id: "manual", label: "Manual" },
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState<Tab>("profiles");
  const [showSettings, setShowSettings] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const { profiles, dirty, markSaved } = useApp();

  const TOUR_FLAG = "skywriter.tourDone";

  // Auto-open the walkthrough on first ever boot.
  useEffect(() => {
    if (booted && !localStorage.getItem(TOUR_FLAG)) setShowTour(true);
  }, [booted]);

  function closeTour() {
    localStorage.setItem(TOUR_FLAG, "1");
    setShowTour(false);
  }

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✈</span>
          <div>
            <div className="brand-name">SkyWriter</div>
            <div className="brand-sub">by KXGroup</div>
          </div>
        </div>

        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={"tab" + (tab === t.id ? " active" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="row gap">
          {(() => {
            const cfg = loadConfig();
            return (
              <span className="muted small" title="Active text · image providers">
                {cfg.textProvider} · {cfg.imageProvider}
                {!textProviderReady(cfg) && (
                  <span className="warn small"> ⚠ setup</span>
                )}
              </span>
            );
          })()}
          <button className="btn" onClick={() => exportProjectSource()}>
            Export Project
          </button>
          <button
            className="icon-btn"
            title="Open guided walkthrough"
            onClick={() => setShowTour(true)}
          >
            ?
          </button>
          <button className="icon-btn" title="Settings" onClick={() => setShowSettings(true)}>
            ⚙
          </button>
        </div>
      </header>

      {dirty && (
        <div className="save-banner">
          ⚠ Your profiles & generations live in memory only and will be lost when you close
          the tab.
          <button
            className="btn small"
            onClick={() => {
              exportProfiles(profiles);
              markSaved();
            }}
          >
            Export profiles now
          </button>
        </div>
      )}

      <div className="layout">
        <main className="main">
          {tab === "profiles" && <ProfileManager />}
          {tab === "press" && <PressReleaseStudio />}
          {tab === "visual" && <VisualAssetEngine />}
          {tab === "manual" && <Manual />}
        </main>
        <Timeline />
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showTour && (
        <Walkthrough onClose={closeTour} onNavigate={(t) => setTab(t)} />
      )}
    </div>
  );
}
