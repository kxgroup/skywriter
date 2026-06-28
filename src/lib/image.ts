// Image (marketing render) generation across switchable providers.
import { GoogleGenAI } from "@google/genai";
import { loadConfig, type AppConfig } from "./config";
import { base64Of, buildImagePrompt, type ImageGenInput } from "./prompt";
import type { StoredImage } from "../types";

export async function generateMarketingRender(
  input: ImageGenInput
): Promise<StoredImage> {
  const cfg = loadConfig();
  switch (cfg.imageProvider) {
    case "gemini":
      return geminiImage(cfg, input);
    case "sdwebui":
      return sdWebuiImage(cfg, input);
    case "pollinations":
      return pollinationsImage(cfg, input);
  }
}

function toStoredImage(mimeType: string, base64: string, icao: string): StoredImage {
  return {
    id: crypto.randomUUID(),
    name: `${icao || "render"}-${Date.now()}.png`,
    mimeType,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

// ─── Gemini ("Nano Banana", reference-aware) ──────────────────────────────────
async function geminiImage(cfg: AppConfig, input: ImageGenInput): Promise<StoredImage> {
  if (!cfg.gemini.apiKey) throw new Error("No Gemini API key set (Settings).");
  const ai = new GoogleGenAI({ apiKey: cfg.gemini.apiKey });
  const { profile } = input;
  const withRefs = !!(profile.livery || profile.logo);
  const parts: any[] = [{ text: buildImagePrompt(input, withRefs) }];
  if (profile.livery)
    parts.push({ inlineData: { mimeType: profile.livery.mimeType, data: base64Of(profile.livery) } });
  if (profile.logo)
    parts.push({ inlineData: { mimeType: profile.logo.mimeType, data: base64Of(profile.logo) } });

  const res = await ai.models.generateContent({
    model: cfg.gemini.imageModel,
    contents: [{ role: "user", parts }],
  });
  const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("Gemini returned no image.");
  return toStoredImage(part.inlineData.mimeType || "image/png", part.inlineData.data, profile.icao);
}

// ─── Stable Diffusion WebUI / Forge (local) ───────────────────────────────────
// Uses img2img with the livery as an init image when available (so the render is
// guided by your livery), otherwise txt2img. Launch the WebUI with:
//   --api --cors-allow-origins=*
async function sdWebuiImage(cfg: AppConfig, input: ImageGenInput): Promise<StoredImage> {
  const { profile } = input;
  const base = cfg.sdwebui.url.replace(/\/$/, "");
  const useImg2Img = cfg.sdwebui.useImg2Img && !!profile.livery;
  const withRefs = !!(profile.livery || profile.logo);

  const common = {
    prompt: buildImagePrompt(input, withRefs),
    negative_prompt:
      "lowres, blurry, watermark, text, logo artifacts, distorted, deformed, jpeg artifacts",
    steps: cfg.sdwebui.steps,
    sampler_name: cfg.sdwebui.sampler,
    cfg_scale: cfg.sdwebui.cfgScale,
    width: cfg.sdwebui.width,
    height: cfg.sdwebui.height,
  };

  const endpoint = useImg2Img ? "/sdapi/v1/img2img" : "/sdapi/v1/txt2img";
  const body: any = useImg2Img
    ? {
        ...common,
        init_images: [profile.livery!.dataUrl],
        denoising_strength: cfg.sdwebui.denoising,
      }
    : common;

  let res: Response;
  try {
    res = await fetch(base + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Could not reach Stable Diffusion WebUI at ${cfg.sdwebui.url}. Launch it with "--api --cors-allow-origins=*" (see README).`
    );
  }
  if (!res.ok) throw new Error(`SD WebUI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data?.images?.[0];
  if (!b64) throw new Error("SD WebUI returned no image.");
  return toStoredImage("image/png", b64, profile.icao);
}

// ─── Pollinations.ai (free hosted, no key) ────────────────────────────────────
async function pollinationsImage(cfg: AppConfig, input: ImageGenInput): Promise<StoredImage> {
  const { profile } = input;
  const prompt = buildImagePrompt(input, false);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${1024}&height=${576}&model=${encodeURIComponent(cfg.pollinations.model)}` +
    `&nologo=true&seed=${Math.floor(Math.random() * 1e6)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations error ${res.status}.`);
  const blob = await res.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
  return {
    id: crypto.randomUUID(),
    name: `${profile.icao || "render"}-${Date.now()}.png`,
    mimeType: blob.type || "image/png",
    dataUrl,
  };
}
