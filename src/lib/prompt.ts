// Shared prompt construction, provider-agnostic.
import type {
  AirlineProfile,
  Generation,
  HardConstraints,
  Length,
  OutputPurpose,
  PrimaryTopic,
  StoredImage,
} from "../types";

export interface TextGenInput {
  profile: AirlineProfile;
  topic: PrimaryTopic;
  purpose: OutputPurpose;
  length: Length;
  constraints: HardConstraints;
  brief: string;
  ingredients: StoredImage[];
  parent?: Generation | null;
}

export interface ImageGenInput {
  profile: AirlineProfile;
  scene: string;
}

/** "data:<mime>;base64,AAAA" -> "AAAA" */
export function base64Of(img: StoredImage): string {
  return img.dataUrl.split(",")[1] ?? "";
}

function lengthGuidance(length: Length): string {
  switch (length) {
    case "Short":
      return "Keep it concise — around 100 words.";
    case "Medium":
      return "Aim for roughly 500 words.";
    case "Long":
      return "Write a thorough piece of 1000+ words with multiple sections.";
  }
}

function constraintGuidance(c: HardConstraints): string {
  if (!c.enabled) return "";
  const parts: string[] = [];
  if (c.maxWords) parts.push(`no more than ${c.maxWords} words`);
  if (c.maxChars) parts.push(`no more than ${c.maxChars} characters total`);
  if (!parts.length) return "";
  return `HARD CONSTRAINT — you MUST obey this exactly: the output must be ${parts.join(
    " and "
  )}. Count carefully and trim until it fits.`;
}

function profileBrief(p: AirlineProfile): string {
  return [
    `Airline name: ${p.name || "(unnamed)"}`,
    `ICAO code: ${p.icao || "(none)"}`,
    `Brand vibe: ${p.vibe}`,
    p.hubs && `Hubs: ${p.hubs}`,
    p.fleet && `Fleet: ${p.fleet}`,
    p.destinations && `Destinations / network: ${p.destinations}`,
    p.allianceName && `Alliance: ${p.allianceName}`,
    p.cabinColors && `Cabin colour scheme: ${p.cabinColors}`,
    p.cabinDescription && `Cabin description: ${p.cabinDescription}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const PRESS_SYSTEM =
  "You are SkyWriter, a senior aviation public-relations copywriter for virtual airlines. " +
  "Write polished, on-brand copy that matches the airline's vibe and the requested output channel. " +
  "Never invent safety-critical facts for emergencies; stay measured and professional. " +
  "Return ONLY the finished copy — no preamble, no markdown headers unless the channel calls for them.";

export function buildPressUserText(input: TextGenInput): string {
  const { profile, topic, purpose, length, constraints, brief, ingredients, parent } =
    input;
  const parts: string[] = [
    `=== AIRLINE PROFILE ===\n${profileBrief(profile)}`,
    `=== ASSIGNMENT ===\nPrimary topic: ${topic}\nOutput purpose / channel: ${purpose}\n${lengthGuidance(
      length
    )}`,
  ];
  if (parent?.text) {
    parts.push(
      `=== PREVIOUS ENTRY IN THIS THREAD (maintain continuity with it) ===\n${parent.text}`
    );
  }
  if (brief.trim()) parts.push(`=== WRITER'S BRIEF / NOTES ===\n${brief.trim()}`);
  if (ingredients.length) {
    parts.push(
      `=== ATTACHED REFERENCE IMAGES ("ingredients") ===\nAnalyse the attached image(s) and weave concrete, specific details from them into the copy (aircraft types, liveries, locations, signage, etc.).`
    );
  }
  const constraint = constraintGuidance(constraints);
  if (constraint) parts.push(`=== ${constraint}`);
  return parts.join("\n\n");
}

export function buildImagePrompt(input: ImageGenInput, withRefs: boolean): string {
  const { profile, scene } = input;
  return [
    `High-quality, photorealistic 16:9 marketing photograph for the virtual airline "${profile.name}".`,
    `Brand vibe: ${profile.vibe}.`,
    profile.cabinColors && `Brand / cabin colours: ${profile.cabinColors}.`,
    profile.fleet && `Fleet context: ${profile.fleet}.`,
    withRefs
      ? "Match the supplied aircraft livery reference (paint scheme, colours) and incorporate the corporate logo."
      : "",
    `Scene: ${scene}`,
    "Cinematic lighting, sharp focus, professional aviation photography. No text watermarks, no captions.",
  ]
    .filter(Boolean)
    .join("\n");
}
