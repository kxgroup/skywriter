// ─── Core domain types for SkyWriter ──────────────────────────────────────────

export type Vibe =
  | "Professional"
  | "Luxury"
  | "Budget"
  | "Vintage"
  | "Futuristic";

export const VIBES: Vibe[] = [
  "Professional",
  "Luxury",
  "Budget",
  "Vintage",
  "Futuristic",
];

/** An uploaded image stored inline as a base64 data URL so it survives export. */
export interface StoredImage {
  id: string;
  name: string;
  mimeType: string;
  /** Full data URL: data:<mime>;base64,<...> */
  dataUrl: string;
}

export interface AirlineProfile {
  id: string;
  name: string;
  icao: string;
  vibe: Vibe;

  // Fleet & network
  hubs: string;
  fleet: string;
  destinations: string;

  // Brand assets
  livery: StoredImage | null;
  logo: StoredImage | null;
  allianceName: string;
  allianceLogo: StoredImage | null;

  // Cabin specifications
  cabinColors: string;
  cabinDescription: string;
}

// ─── Press Release generation ────────────────────────────────────────────────

export type PrimaryTopic =
  | "Route Announcement"
  | "Fleet Expansion"
  | "Hiring / Recruitment"
  | "Emergency / Incident Update"
  | "Partnership / Alliance"
  | "Promotion / Sale"
  | "Milestone / Anniversary"
  | "General Update";

export const PRIMARY_TOPICS: PrimaryTopic[] = [
  "Route Announcement",
  "Fleet Expansion",
  "Hiring / Recruitment",
  "Emergency / Incident Update",
  "Partnership / Alliance",
  "Promotion / Sale",
  "Milestone / Anniversary",
  "General Update",
];

export type OutputPurpose =
  | "Social Media"
  | "Press Release"
  | "Blog Post"
  | "Investor Relations"
  | "Internal Memo";

export const OUTPUT_PURPOSES: OutputPurpose[] = [
  "Social Media",
  "Press Release",
  "Blog Post",
  "Investor Relations",
  "Internal Memo",
];

export type Length = "Short" | "Medium" | "Long";

export const LENGTHS: { value: Length; label: string }[] = [
  { value: "Short", label: "Short (~100 words)" },
  { value: "Medium", label: "Medium (~500 words)" },
  { value: "Long", label: "Long (~1000+ words)" },
];

export interface HardConstraints {
  enabled: boolean;
  maxWords: number | null;
  maxChars: number | null;
}

// ─── Timeline / generations ──────────────────────────────────────────────────

export type GenerationKind = "text" | "image";

export interface Generation {
  id: string;
  kind: GenerationKind;
  profileId: string;
  profileName: string;
  title: string;
  createdAt: number;

  // text generations
  topic?: PrimaryTopic;
  purpose?: OutputPurpose;
  text?: string;

  // image generations
  image?: StoredImage;

  // threading / context chaining
  parentId: string | null;
}
