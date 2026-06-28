import type { AirlineProfile, StoredImage } from "../types";

// ─── Image upload → base64 ────────────────────────────────────────────────────
export function fileToStoredImage(file: File): Promise<StoredImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || "image/png",
        dataUrl: reader.result as string,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Generic file download ────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ─── Profile export / import (.json, includes base64 image assets) ─────────────
export interface ProfileExport {
  app: "SkyWriter";
  version: 1;
  exportedAt: string;
  profiles: AirlineProfile[];
}

export function exportProfiles(profiles: AirlineProfile[]) {
  const payload: ProfileExport = {
    app: "SkyWriter",
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `skywriter-profiles-${Date.now()}.json`);
}

export function parseProfileImport(text: string): AirlineProfile[] {
  const data = JSON.parse(text);
  const profiles: AirlineProfile[] = Array.isArray(data)
    ? data
    : data?.profiles;
  if (!Array.isArray(profiles)) {
    throw new Error("This file does not contain a valid SkyWriter profile list.");
  }
  // Re-key ids to avoid collisions with current session.
  return profiles.map((p) => ({ ...p, id: crypto.randomUUID() }));
}

// ─── Project source export (bundle the app's own source into a ZIP) ────────────
export async function exportProjectSource() {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  // Vite exposes every source file as a raw string at build time.
  const sources = import.meta.glob("/src/**/*", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  for (const [path, content] of Object.entries(sources)) {
    // strip leading slash so the zip has a clean tree
    zip.file(path.replace(/^\//, ""), content);
  }

  zip.file(
    "README-export.txt",
    [
      "SkyWriter — exported project source",
      "",
      "This ZIP contains the application source (the /src tree).",
      "To run it, drop these files into a Vite + React + TypeScript project,",
      "run `npm install` then `npm run dev`, and supply a Gemini API key.",
      "",
      `Exported: ${new Date().toISOString()}`,
    ].join("\n")
  );

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `skywriter-source-${Date.now()}.zip`);
}
