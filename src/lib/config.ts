// Central, switchable provider configuration (persisted in localStorage).

export type TextProvider = "ollama" | "gemini" | "groq";
export type ImageProvider = "sdwebui" | "gemini" | "pollinations";

export interface AppConfig {
  textProvider: TextProvider;
  imageProvider: ImageProvider;

  gemini: { apiKey: string; textModel: string; imageModel: string };
  groq: { apiKey: string; model: string };
  ollama: { url: string; model: string };
  sdwebui: {
    url: string;
    steps: number;
    sampler: string;
    cfgScale: number;
    width: number;
    height: number;
    denoising: number; // img2img strength when a livery reference is used
    useImg2Img: boolean; // use livery as an init image when available
  };
  pollinations: { model: string };
}

// Local-first defaults — the fully-local path (Ollama + SD WebUI) is the default
// since the hardware can handle it. Falls back are a click away in Settings.
export const DEFAULT_CONFIG: AppConfig = {
  textProvider: "ollama",
  imageProvider: "sdwebui",

  gemini: {
    apiKey: "",
    textModel: "gemini-2.5-flash",
    imageModel: "gemini-2.5-flash-image-preview",
  },
  groq: {
    apiKey: "",
    // Vision-capable, multimodal model. If Groq renames it, edit here.
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
  },
  ollama: {
    url: "http://127.0.0.1:11434",
    // Multimodal (handles "ingredient" images) on Ollama's native engine.
    // NOTE: "llama3.2-vision" can fail with `unknown model architecture: 'mllama'`
    // on some runtimes — gemma3 avoids that. Alternatives: "qwen2.5vl:7b", "llava:7b".
    model: "gemma3:4b",
  },
  sdwebui: {
    url: "http://127.0.0.1:7860",
    steps: 26,
    sampler: "Euler a",
    cfgScale: 6,
    width: 1024,
    height: 576, // 16:9
    denoising: 0.65,
    useImg2Img: true,
  },
  pollinations: { model: "flux" },
};

const KEY = "skywriter.config";

function deepMerge<T>(base: T, patch: any): T {
  if (typeof base !== "object" || base === null) return (patch ?? base) as T;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const k of Object.keys(base as any)) {
    if (patch && k in patch) out[k] = deepMerge((base as any)[k], patch[k]);
  }
  return out;
}

export function loadConfig(): AppConfig {
  let stored: any = {};
  try {
    stored = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    stored = {};
  }
  const cfg = deepMerge(DEFAULT_CONFIG, stored);

  // Migrate the legacy standalone Gemini key, if present.
  if (!cfg.gemini.apiKey) {
    const legacy = localStorage.getItem("skywriter.geminiApiKey");
    if (legacy) cfg.gemini.apiKey = legacy;
  }
  return cfg;
}

export function saveConfig(cfg: AppConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

/** Whether the selected text provider has what it needs to run. */
export function textProviderReady(cfg: AppConfig): boolean {
  switch (cfg.textProvider) {
    case "gemini":
      return !!cfg.gemini.apiKey;
    case "groq":
      return !!cfg.groq.apiKey;
    case "ollama":
      return !!cfg.ollama.url; // reachability checked at call time
  }
}

export function imageProviderReady(cfg: AppConfig): boolean {
  switch (cfg.imageProvider) {
    case "gemini":
      return !!cfg.gemini.apiKey;
    case "sdwebui":
      return !!cfg.sdwebui.url;
    case "pollinations":
      return true;
  }
}
