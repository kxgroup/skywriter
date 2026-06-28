import { useState } from "react";
import { useApp } from "../context/AppContext";
import { generateMarketingRender } from "../lib/image";
import { downloadDataUrl } from "../lib/storage";
import type { StoredImage } from "../types";

// Image generation is temporarily disabled while the render pipeline is being
// reworked. Flip this back to `true` to re-enable the engine.
const IMAGE_GEN_ENABLED = false;

const SCENE_PRESETS = [
  "Aircraft on final approach over a coastal city at golden hour",
  "Hero shot on the apron at dawn, ground crew nearby",
  "Cabin interior, premium seat with a window view of clouds",
  "Aircraft parked at a futuristic terminal gate at night",
];

export default function VisualAssetEngine() {
  const { activeProfile, addGeneration } = useApp();
  const [scene, setScene] = useState(SCENE_PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<StoredImage | null>(null);
  // Show the "under development" notice each time the tab is opened.
  const [showNotice, setShowNotice] = useState(!IMAGE_GEN_ENABLED);

  async function generate() {
    if (!activeProfile || !IMAGE_GEN_ENABLED) return;
    setBusy(true);
    setError(null);
    try {
      const image = await generateMarketingRender({ profile: activeProfile, scene });
      setLatest(image);
      addGeneration({
        id: crypto.randomUUID(),
        kind: "image",
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        title: scene.slice(0, 48),
        createdAt: Date.now(),
        image,
        parentId: null,
      });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!activeProfile) return null;
  const noRefs = !activeProfile.livery && !activeProfile.logo;
  const disabled = !IMAGE_GEN_ENABLED;

  return (
    <div className="panel">
      {showNotice && (
        <div className="modal-backdrop" onClick={() => setShowNotice(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🚧 Feature under development</h2>
            <p>
              Visual asset generation is temporarily disabled while the render engine is
              being reworked. You can still build profiles and write press releases — image
              renders will return in a future update.
            </p>
            <div className="modal-actions">
              <button className="btn primary" onClick={() => setShowNotice(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="panel-header">
        <h2>Visual Asset Engine</h2>
        <span className="muted">16:9 marketing renders for <b>{activeProfile.name}</b></span>
      </div>

      {disabled && (
        <div className="warn" style={{ marginBottom: 12 }}>
          🚧 Image generation is <b>under development</b> and temporarily unavailable. The
          controls below are previewed but disabled.
        </div>
      )}

      <div className="grid two">
        <section className="card">
          <h3>Scene</h3>
          {noRefs && (
            <div className="warn small">
              Tip: add a livery and logo in the Profiles tab so renders match your brand.
            </div>
          )}
          <div className="row gap wrap">
            <RefThumb label="Livery" img={activeProfile.livery} />
            <RefThumb label="Logo" img={activeProfile.logo} />
          </div>
          <label className="field-label">Scene description</label>
          <textarea
            className="textarea"
            rows={4}
            value={scene}
            disabled={disabled}
            onChange={(e) => setScene(e.target.value)}
          />
          <div className="presets">
            {SCENE_PRESETS.map((s) => (
              <button key={s} className="chip" disabled={disabled} onClick={() => setScene(s)}>
                {s.slice(0, 28)}…
              </button>
            ))}
          </div>
          <button
            className="btn primary big"
            onClick={disabled ? () => setShowNotice(true) : generate}
            disabled={busy}
            title={disabled ? "Under development" : undefined}
          >
            {disabled ? "Under development" : busy ? "Rendering…" : "Generate render"}
          </button>
          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="card">
          <h3>Latest render</h3>
          {latest ? (
            <div className="render-result">
              <img src={latest.dataUrl} alt="render" />
              <button className="btn" onClick={() => downloadDataUrl(latest.dataUrl, latest.name)}>
                Save to device
              </button>
            </div>
          ) : (
            <p className="muted">No render yet. Image generation is under development.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function RefThumb({ label, img }: { label: string; img: StoredImage | null }) {
  return (
    <div className="ref-thumb">
      <span className="muted small">{label}</span>
      {img ? <img src={img.dataUrl} alt={label} /> : <div className="ref-empty">—</div>}
    </div>
  );
}
