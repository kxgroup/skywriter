// Text (press release) generation across switchable providers.
import { GoogleGenAI } from "@google/genai";
import { loadConfig, type AppConfig } from "./config";
import {
  base64Of,
  buildPressUserText,
  PRESS_SYSTEM,
  type TextGenInput,
} from "./prompt";
import type { StoredImage } from "../types";

export async function generatePressRelease(input: TextGenInput): Promise<string> {
  const cfg = loadConfig();
  switch (cfg.textProvider) {
    case "gemini":
      return geminiText(cfg, input);
    case "ollama":
      return ollamaText(cfg, input);
    case "groq":
      return groqText(cfg, input);
  }
}

// ─── Gemini ───────────────────────────────────────────────────────────────────
async function geminiText(cfg: AppConfig, input: TextGenInput): Promise<string> {
  if (!cfg.gemini.apiKey) throw new Error("No Gemini API key set (Settings).");
  const ai = new GoogleGenAI({ apiKey: cfg.gemini.apiKey });
  const parts: any[] = [{ text: buildPressUserText(input) }];
  for (const img of input.ingredients)
    parts.push({ inlineData: { mimeType: img.mimeType, data: base64Of(img) } });

  const res = await ai.models.generateContent({
    model: cfg.gemini.textModel,
    contents: [{ role: "user", parts }],
    config: { systemInstruction: PRESS_SYSTEM, temperature: 0.9 },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Gemini returned no text.");
  return text;
}

// ─── Ollama (local) ───────────────────────────────────────────────────────────
async function ollamaText(cfg: AppConfig, input: TextGenInput): Promise<string> {
  const url = cfg.ollama.url.replace(/\/$/, "") + "/api/chat";
  const images = input.ingredients.map((i: StoredImage) => base64Of(i));

  const body = {
    model: cfg.ollama.model,
    stream: false,
    options: { temperature: 0.9 },
    messages: [
      { role: "system", content: PRESS_SYSTEM },
      {
        role: "user",
        content: buildPressUserText(input),
        ...(images.length ? { images } : {}),
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Could not reach Ollama at ${cfg.ollama.url}. Is it running? Start it with "ollama serve" and set OLLAMA_ORIGINS=* (see README).`
    );
  }
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data?.message?.content || "").trim();
  if (!text) throw new Error("Ollama returned no text. Is the model pulled?");
  return text;
}

// ─── Groq (free hosted, OpenAI-compatible) ────────────────────────────────────
async function groqText(cfg: AppConfig, input: TextGenInput): Promise<string> {
  if (!cfg.groq.apiKey) throw new Error("No Groq API key set (Settings).");
  const content: any[] = [{ type: "text", text: buildPressUserText(input) }];
  for (const img of input.ingredients) {
    content.push({ type: "image_url", image_url: { url: img.dataUrl } });
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.groq.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.groq.model,
      temperature: 0.9,
      messages: [
        { role: "system", content: PRESS_SYSTEM },
        { role: "user", content },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new Error("Groq returned no text.");
  return text;
}
