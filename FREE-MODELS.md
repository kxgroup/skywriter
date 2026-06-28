# Running SkyWriter for free (no paid API)

SkyWriter now supports switchable providers. Pick them in **⚙ Settings** — text and
images are chosen independently. Your hardware (RTX 4060, 8 GB VRAM, 16 GB RAM) runs
the fully-local stack comfortably.

| | Local & free | Hosted & free |
|---|---|---|
| **Text** | Ollama | Groq |
| **Images** | Stable Diffusion WebUI / Forge | Pollinations.ai |

---

## A. Fully local (recommended — $0, offline, private)

### 1. Text + image-analysis → Ollama

```powershell
# Install: https://ollama.com/download  (winget install Ollama.Ollama)

# Pull a vision-capable model (needed so "ingredient" images are analysed).
ollama pull gemma3:4b           # ~3 GB, tested default, fast on 8 GB VRAM
# higher-quality / alternative vision models:
ollama pull qwen2.5vl:7b        # ~6 GB
ollama pull llava:7b            # ~4.7 GB

# Allow the SkyWriter desktop app to call Ollama (one time).
setx OLLAMA_ORIGINS "*"
```

**Do not run `ollama serve`.** Installing Ollama starts a background service (system
tray) that already listens on port 11434. Running `serve` again just throws
`bind: Only one usage of each socket address ...` — that error means it's already up.
Verify with `ollama list` and `(Invoke-RestMethod http://127.0.0.1:11434/api/version).version`.

In SkyWriter ⚙ → Text engine → **Ollama**, model `gemma3:4b` (or whichever you
pulled). URL stays `http://127.0.0.1:11434`.

> ⚠️ **Avoid `llama3.2-vision`** — it can fail with `unknown model architecture:
> 'mllama'` on some Ollama runtimes. `gemma3:4b`, `qwen2.5vl:7b`, and `llava:7b` use
> Ollama's native engine and load reliably.

### 2. Marketing renders → Stable Diffusion WebUI (A1111) or Forge

```powershell
# Easiest on NVIDIA: Stable Diffusion WebUI Forge
#   https://github.com/lllyasviel/stable-diffusion-webui-forge
# or AUTOMATIC1111
#   https://github.com/AUTOMATIC1111/stable-diffusion-webui

# Download an SDXL checkpoint (e.g. from civitai.com or huggingface.co) into
#   webui\models\Stable-diffusion\

# IMPORTANT — launch with the API + CORS enabled. Edit webui-user.bat:
#   set COMMANDLINE_ARGS=--api --cors-allow-origins=*
# then run:
webui-user.bat
```

In SkyWriter ⚙ → Image engine → **Stable Diffusion WebUI**, URL `http://127.0.0.1:7860`.

- With **"Use livery as a reference (img2img)"** ticked (default), the render is guided
  by your uploaded livery image.
- **Reference fidelity caveat:** open SD captures *style, palette, and subject*, not an
  exact logo. For pixel-accurate logos, install the **ControlNet + IP-Adapter** extension
  in the WebUI and use it as your checkpoint pipeline — or use Gemini for that one render.

---

## B. Hosted & free (no downloads, works on any machine, rate-limited)

- **Text → Groq:** free key at <https://console.groq.com>. ⚙ → Text engine → Groq, paste
  key. Check the current model id at <https://console.groq.com/docs/models> (use a
  *vision* model if you attach ingredient images) and update the Model field.
- **Images → Pollinations.ai:** ⚙ → Image engine → Pollinations. No key, no setup. Lower
  control and no true logo/livery referencing, but instant and free.

---

## C. Keep Gemini (best image references)

⚙ → set either engine to **Gemini** and paste a key from
<https://aistudio.google.com/apikey>. Note the image model is generally **paid**; the
text model has a free tier.

---

## Which keeps every feature?

All providers preserve the full SkyWriter feature set (profiles, chaining, timeline,
constraints, etc.). The only quality difference is **image reference accuracy**:
Gemini > local SD with IP-Adapter > local SD img2img > Pollinations.
