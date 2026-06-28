import { useState } from "react";
import {
  loadConfig,
  saveConfig,
  type AppConfig,
  type ImageProvider,
  type TextProvider,
} from "../lib/config";

export default function Settings({ onClose }: { onClose: () => void }) {
  const [cfg, setCfg] = useState<AppConfig>(() => loadConfig());

  function patch(p: Partial<AppConfig>) {
    setCfg((c) => ({ ...c, ...p }));
  }
  function patchSection<K extends keyof AppConfig>(key: K, p: Partial<AppConfig[K]>) {
    setCfg((c) => ({ ...c, [key]: { ...(c[key] as any), ...p } }));
  }
  function save() {
    saveConfig(cfg);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>Settings · Providers</h2>

        {/* ── TEXT ─────────────────────────────────── */}
        <h3>Text engine (press releases)</h3>
        <label className="field-label">Provider</label>
        <select
          className="select"
          value={cfg.textProvider}
          onChange={(e) => patch({ textProvider: e.target.value as TextProvider })}
        >
          <option value="ollama">Ollama — local, free, private</option>
          <option value="groq">Groq — free hosted, fast</option>
          <option value="gemini">Google Gemini — paid / free-tier</option>
        </select>

        {cfg.textProvider === "ollama" && (
          <div className="row gap wrap">
            <Field label="Ollama URL" wide
              value={cfg.ollama.url}
              onChange={(v) => patchSection("ollama", { url: v })} />
            <Field label="Model (must be vision-capable for ingredients)"
              value={cfg.ollama.model}
              onChange={(v) => patchSection("ollama", { model: v })} />
          </div>
        )}
        {cfg.textProvider === "groq" && (
          <>
            <Field label="Groq API key" password
              value={cfg.groq.apiKey}
              onChange={(v) => patchSection("groq", { apiKey: v })} />
            <Field label="Model"
              value={cfg.groq.model}
              onChange={(v) => patchSection("groq", { model: v })} />
            <p className="muted small">Free key: console.groq.com · model list: console.groq.com/docs/models</p>
          </>
        )}
        {cfg.textProvider === "gemini" && (
          <GeminiKey cfg={cfg} patchSection={patchSection} />
        )}

        {/* ── IMAGE ────────────────────────────────── */}
        <h3 style={{ marginTop: 20 }}>Image engine (marketing renders)</h3>
        <label className="field-label">Provider</label>
        <select
          className="select"
          value={cfg.imageProvider}
          onChange={(e) => patch({ imageProvider: e.target.value as ImageProvider })}
        >
          <option value="sdwebui">Stable Diffusion WebUI — local, free</option>
          <option value="pollinations">Pollinations.ai — free hosted, no key</option>
          <option value="gemini">Google Gemini — paid, best references</option>
        </select>

        {cfg.imageProvider === "sdwebui" && (
          <>
            <Field label="SD WebUI URL (launch with --api --cors-allow-origins=*)" wide
              value={cfg.sdwebui.url}
              onChange={(v) => patchSection("sdwebui", { url: v })} />
            <div className="row gap wrap">
              <NumField label="Steps" value={cfg.sdwebui.steps}
                onChange={(v) => patchSection("sdwebui", { steps: v })} />
              <NumField label="CFG" value={cfg.sdwebui.cfgScale}
                onChange={(v) => patchSection("sdwebui", { cfgScale: v })} />
              <NumField label="Width" value={cfg.sdwebui.width}
                onChange={(v) => patchSection("sdwebui", { width: v })} />
              <NumField label="Height" value={cfg.sdwebui.height}
                onChange={(v) => patchSection("sdwebui", { height: v })} />
            </div>
            <Field label="Sampler"
              value={cfg.sdwebui.sampler}
              onChange={(v) => patchSection("sdwebui", { sampler: v })} />
            <label className="check">
              <input type="checkbox" checked={cfg.sdwebui.useImg2Img}
                onChange={(e) => patchSection("sdwebui", { useImg2Img: e.target.checked })} />
              Use livery as a reference (img2img) when available
            </label>
          </>
        )}
        {cfg.imageProvider === "pollinations" && (
          <Field label="Model"
            value={cfg.pollinations.model}
            onChange={(v) => patch({ pollinations: { model: v } })} />
        )}
        {cfg.imageProvider === "gemini" && (
          <GeminiKey cfg={cfg} patchSection={patchSection} />
        )}

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

function GeminiKey({
  cfg,
  patchSection,
}: {
  cfg: AppConfig;
  patchSection: <K extends keyof AppConfig>(k: K, p: Partial<AppConfig[K]>) => void;
}) {
  return (
    <>
      <Field label="Gemini API key" password
        value={cfg.gemini.apiKey}
        onChange={(v) => patchSection("gemini", { apiKey: v })} />
      <p className="muted small">Free key at aistudio.google.com/apikey</p>
    </>
  );
}

function Field({
  label, value, onChange, password, wide,
}: {
  label: string; value: string; onChange: (v: string) => void;
  password?: boolean; wide?: boolean;
}) {
  return (
    <div style={{ flex: wide ? "1 1 100%" : "1 1 220px", minWidth: 180 }}>
      <label className="field-label">{label}</label>
      <input
        className="text-input"
        type={password ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumField({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ flex: "1 1 90px", minWidth: 80 }}>
      <label className="field-label">{label}</label>
      <input
        className="text-input"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
