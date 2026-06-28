import { useRef } from "react";
import { useApp } from "../context/AppContext";
import { VIBES } from "../types";
import ImageUpload from "./ImageUpload";
import {
  exportProfiles,
  parseProfileImport,
} from "../lib/storage";

export default function ProfileManager() {
  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    importProfiles,
    markSaved,
  } = useApp();
  const importRef = useRef<HTMLInputElement>(null);

  if (!activeProfile) return null;
  const p = activeProfile;
  const set = (patch: Partial<typeof p>) => updateProfile(p.id, patch);

  async function handleImport(file?: File) {
    if (!file) return;
    try {
      const text = await file.text();
      importProfiles(parseProfileImport(text));
    } catch (e: any) {
      alert("Import failed: " + e.message);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Airline Identity & Profiles</h2>
        <div className="row gap">
          <select
            className="select"
            value={activeProfileId ?? ""}
            onChange={(e) => setActiveProfileId(e.target.value)}
          >
            {profiles.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name || "(unnamed)"} {pr.icao ? `· ${pr.icao}` : ""}
              </option>
            ))}
          </select>
          <button className="btn" onClick={addProfile}>
            + New
          </button>
          <button
            className="btn"
            onClick={() => {
              exportProfiles(profiles);
              markSaved();
            }}
          >
            Export
          </button>
          <button className="btn" onClick={() => importRef.current?.click()}>
            Import
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm(`Delete profile "${p.name}"?`)) deleteProfile(p.id);
            }}
          >
            Delete
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => handleImport(e.target.files?.[0] ?? undefined)}
          />
        </div>
      </div>

      <div className="grid two">
        <section className="card">
          <h3>Identity</h3>
          <label className="field-label">Airline name</label>
          <input
            className="text-input"
            value={p.name}
            onChange={(e) => set({ name: e.target.value })}
          />
          <label className="field-label">ICAO code</label>
          <input
            className="text-input"
            maxLength={4}
            value={p.icao}
            onChange={(e) => set({ icao: e.target.value.toUpperCase() })}
          />
          <label className="field-label">Vibe</label>
          <select
            className="select"
            value={p.vibe}
            onChange={(e) => set({ vibe: e.target.value as any })}
          >
            {VIBES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </section>

        <section className="card">
          <h3>Fleet & Network</h3>
          <label className="field-label">Hubs</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="e.g. KLAX, KJFK"
            value={p.hubs}
            onChange={(e) => set({ hubs: e.target.value })}
          />
          <label className="field-label">Fleet</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="e.g. 12x A320neo, 4x B787-9"
            value={p.fleet}
            onChange={(e) => set({ fleet: e.target.value })}
          />
          <label className="field-label">Destinations / network area</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="e.g. Trans-Pacific, US domestic"
            value={p.destinations}
            onChange={(e) => set({ destinations: e.target.value })}
          />
        </section>

        <section className="card">
          <h3>Brand Assets</h3>
          <div className="row gap wrap">
            <ImageUpload
              label="Aircraft livery"
              value={p.livery}
              onChange={(img) => set({ livery: img })}
            />
            <ImageUpload
              label="Corporate logo"
              value={p.logo}
              onChange={(img) => set({ logo: img })}
            />
          </div>
          <label className="field-label">Alliance name</label>
          <input
            className="text-input"
            value={p.allianceName}
            onChange={(e) => set({ allianceName: e.target.value })}
          />
          <ImageUpload
            label="Alliance logo"
            value={p.allianceLogo}
            onChange={(img) => set({ allianceLogo: img })}
          />
        </section>

        <section className="card">
          <h3>Cabin Specifications</h3>
          <label className="field-label">Interior colour scheme</label>
          <input
            className="text-input"
            placeholder="e.g. midnight blue & brushed gold"
            value={p.cabinColors}
            onChange={(e) => set({ cabinColors: e.target.value })}
          />
          <label className="field-label">Cabin description</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Seat layout, materials, ambience, signature touches…"
            value={p.cabinDescription}
            onChange={(e) => set({ cabinDescription: e.target.value })}
          />
        </section>
      </div>
    </div>
  );
}
