import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  LENGTHS,
  OUTPUT_PURPOSES,
  PRIMARY_TOPICS,
  type HardConstraints,
  type Length,
  type OutputPurpose,
  type PrimaryTopic,
  type StoredImage,
} from "../types";
import { fileToStoredImage } from "../lib/storage";
import { generatePressRelease } from "../lib/text";

export default function PressReleaseStudio() {
  const { activeProfile, addGeneration, generations, activeChainId, setActiveChainId } =
    useApp();

  const [topic, setTopic] = useState<PrimaryTopic>("Route Announcement");
  const [purpose, setPurpose] = useState<OutputPurpose>("Press Release");
  const [length, setLength] = useState<Length>("Medium");
  const [brief, setBrief] = useState("");
  const [ingredients, setIngredients] = useState<StoredImage[]>([]);
  const [constraints, setConstraints] = useState<HardConstraints>({
    enabled: false,
    maxWords: 280,
    maxChars: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const parent = generations.find((g) => g.id === activeChainId && g.kind === "text") ?? null;

  async function addIngredient(file?: File) {
    if (!file) return;
    const img = await fileToStoredImage(file);
    setIngredients((prev) => [...prev, img]);
  }

  async function generate() {
    if (!activeProfile) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const text = await generatePressRelease({
        profile: activeProfile,
        topic,
        purpose,
        length,
        constraints,
        brief,
        ingredients,
        parent,
      });
      setResult(text);
      const gen = {
        id: crypto.randomUUID(),
        kind: "text" as const,
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        title: `${topic} · ${purpose}`,
        createdAt: Date.now(),
        topic,
        purpose,
        text,
        parentId: parent?.id ?? null,
      };
      addGeneration(gen);
      // Continue the thread from the piece we just made.
      setActiveChainId(gen.id);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!activeProfile) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>AI Press Release Suite</h2>
        <span className="muted">Writing as <b>{activeProfile.name}</b></span>
      </div>

      <div className="grid two">
        <section className="card">
          <h3>Brief</h3>
          <label className="field-label">Primary topic</label>
          <select className="select" value={topic} onChange={(e) => setTopic(e.target.value as PrimaryTopic)}>
            {PRIMARY_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <label className="field-label">Output purpose</label>
          <select className="select" value={purpose} onChange={(e) => setPurpose(e.target.value as OutputPurpose)}>
            {OUTPUT_PURPOSES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <label className="field-label">Length</label>
          <select className="select" value={length} onChange={(e) => setLength(e.target.value as Length)}>
            {LENGTHS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <label className="field-label">Notes / details for the writer</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="What's the announcement? Dates, cities, numbers, tone…"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
        </section>

        <section className="card">
          <h3>Constraints & Context</h3>

          <label className="check">
            <input
              type="checkbox"
              checked={constraints.enabled}
              onChange={(e) => setConstraints({ ...constraints, enabled: e.target.checked })}
            />
            Hard limits (strict)
          </label>
          {constraints.enabled && (
            <div className="row gap">
              <div>
                <label className="field-label">Max words</label>
                <input
                  className="text-input"
                  type="number"
                  value={constraints.maxWords ?? ""}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      maxWords: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <label className="field-label">Max characters</label>
                <input
                  className="text-input"
                  type="number"
                  value={constraints.maxChars ?? ""}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      maxChars: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          )}

          <label className="field-label">Context chaining</label>
          {parent ? (
            <div className="chain-pill">
              Chained to: <b>{parent.title}</b>
              <button className="link-btn" onClick={() => setActiveChainId(null)}>
                release
              </button>
            </div>
          ) : (
            <p className="muted small">
              No active chain. Generate a piece (or pick one in the Timeline) to continue a thread.
            </p>
          )}

          <label className="field-label">Ingredients (reference images)</label>
          <div className="ingredients">
            {ingredients.map((img, i) => (
              <div key={img.id} className="ingredient">
                <img src={img.dataUrl} alt={img.name} />
                <button
                  className="x"
                  onClick={() => setIngredients((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
            <label className="ingredient add">
              +
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => addIngredient(e.target.files?.[0] ?? undefined)}
              />
            </label>
          </div>
        </section>
      </div>

      <div className="row gap center">
        <button className="btn primary big" onClick={generate} disabled={busy}>
          {busy ? "Generating…" : "Generate copy"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <section className="card output">
          <div className="row between">
            <h3>Output</h3>
            <div className="row gap">
              <span className="muted small">
                {result.trim().split(/\s+/).length} words · {result.length} chars
              </span>
              <button className="btn" onClick={() => navigator.clipboard.writeText(result)}>
                Copy
              </button>
            </div>
          </div>
          <pre className="copy-output">{result}</pre>
        </section>
      )}
    </div>
  );
}
