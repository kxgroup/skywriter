# SkyWriter (local recreation)

A locally-runnable recreation of **SkyWriter by KXGroup** — a PR & asset generation
suite for virtual airlines. Built with Vite + React + TypeScript. It runs **fully local
and free by default**, using [Ollama](https://ollama.com) for AI text generation on your
own machine — no account, no API key, no per-use cost. Optional cloud providers (Groq,
Gemini) are available but not required.

## What it does

- **Profiles** — multi-profile airline identities (name, ICAO, vibe, hubs, fleet,
  destinations, livery/logo/alliance assets, cabin specs). Export/import as `.json`.
- **Press Release Suite** — multimodal copy generation with topic/purpose/length
  presets, hard word/character limits, image "ingredients", and context chaining.
- **Visual Asset Engine** — 16:9 marketing renders using your livery + logo as visual
  references. _🚧 Currently under development and disabled in the UI._
- **Timeline Explorer** — generations filed into a collapsible thread tree with copy /
  download / chain quick-actions.
- **Tools** — boot diagnostics screen, project-source ZIP export, operations manual, and
  a "data is volatile, export your profiles" reminder banner.

> ⚠️ Like the original, data is held **in memory only** and is lost when you close the
> tab. Use **Export** to save a backup. (Your API key is the one thing kept in
> `localStorage` for convenience.)

## Requirements

- [Node.js](https://nodejs.org) 18+ (includes `npm`)
- **[Ollama](https://ollama.com/download)** for the default local AI text engine (free) —
  setup steps below. _(Optional: a Groq or Gemini key instead — see the table at the bottom.)_

## Download & set up (first-time users)

New here? These four steps take you from nothing installed to a running app.

### 1. Install the prerequisites

- **[Node.js](https://nodejs.org) 18+** (includes `npm`). Verify in a terminal: `node -v`.
- **[Git](https://git-scm.com/downloads)** — only needed for the `git clone` method in step 2.
  Verify: `git --version`.
- **[Ollama](https://ollama.com/download)** — the free local AI engine. You'll configure it
  in step 4, so you can install it now or then.

### 2. Get the code from GitHub

**Option A — clone with Git** (recommended; makes future updates a one-liner):

```powershell
git clone https://github.com/kxgroup/skywriter.git
cd skywriter
```

Later, pull the latest version anytime with `git pull`.

**Option B — download a ZIP** (no Git required):

1. Open <https://github.com/kxgroup/skywriter>.
2. Click the green **Code** button → **Download ZIP**.
3. Right-click the downloaded file → **Extract All…**.
4. Open a terminal **inside** the extracted `skywriter` folder (in File Explorer:
   address bar → type `powershell` → Enter).

### 3. Install dependencies and start the app

```powershell
npm install      # one-time: downloads packages into node_modules/ (takes a minute)
npm run dev      # starts SkyWriter at http://localhost:5173
```

Leave that terminal open and visit <http://localhost:5173> in your browser. To stop the
app, press `Ctrl+C` in the terminal. (Prefer a real desktop app instead of a browser tab?
See **[Build a desktop .exe](#build-a-desktop-exe)** below.)

### 4. Set up the AI engine, then you're ready

The app opens, but it needs a **text engine** before it can generate copy. Follow
**[Set up the free local AI (Ollama)](#set-up-the-free-local-ai-ollama-for-text--image-analysis)**
just below, then open **⚙ Settings** and confirm the provider. The default is the
**free, fully-local stack** — no account or API key required.

> **Troubleshooting:** `npm` not recognized? Node.js isn't installed or the terminal
> needs reopening. `git` not recognized? Use ZIP Option B. Port 5173 busy? Vite will pick
> the next free port — use whatever URL it prints.

## Set up the free local AI (Ollama, for text + image analysis)

SkyWriter's default text engine is **Ollama**, running open-weight models on your own
machine at no cost. One-time setup:

```powershell
# 1. Install Ollama (or download from https://ollama.com/download)
winget install Ollama.Ollama

# 2. Pull a vision-capable model. gemma3:4b is the tested default — it handles the
#    press-release "ingredient" images and loads cleanly on 8 GB VRAM.
ollama pull gemma3:4b

# 3. Allow the SkyWriter desktop app to call Ollama (one time), then restart Ollama.
setx OLLAMA_ORIGINS "*"
```

That's it. **Do not run `ollama serve`** — installing Ollama starts a background
service automatically (you'll see it in the system tray). If you run `ollama serve`
yourself you'll get:

```
Error: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address ...
```

…which just means it's *already running*. Confirm it's up with:

```powershell
ollama list                                   # shows your models
(Invoke-RestMethod http://127.0.0.1:11434/api/version).version   # prints a version
```

In SkyWriter ⚙ → **Text engine → Ollama**, model `gemma3:4b`, URL
`http://127.0.0.1:11434`.

> **Heads-up on `llama3.2-vision`:** it can fail to load with
> `unknown model architecture: 'mllama'` on some Ollama builds. Use `gemma3:4b` (or
> `qwen2.5vl:7b` / `llava:7b`) instead — these use Ollama's native engine and work.

For the local **image** engine (Stable Diffusion WebUI) and the free *hosted*
options (Groq, Pollinations), see **[FREE-MODELS.md](FREE-MODELS.md)**.

## Build a desktop .exe

The app is wrapped with Electron so it runs as a normal Windows desktop program.

```powershell
npm run dist
```

This (1) renders the icon, (2) builds the web app, (3) packages a standalone
`release\SkyWriter-win32-x64\SkyWriter.exe`, and (4) drops a **SkyWriter** shortcut
(with icon) on your Desktop. Double-click it to launch — no browser, no terminal.

`npm run dist` installs to `%LOCALAPPDATA%\Programs\SkyWriter`, adds Desktop +
Start Menu shortcuts, and registers the app in **Settings → Apps** so it has a
normal entry (and icon) like any installed program.

- The exe is **unsigned**, so the first launch may show a SmartScreen prompt →
  *More info* → *Run anyway*.
- Rebuild/reinstall after any code change with `npm run dist`.

### Uninstall

Remove it any of these ways:

- **Settings → Apps → SkyWriter → Uninstall**, or
- run `npm run uninstall:app` from the project, or
- run the bundled `%LOCALAPPDATA%\Programs\SkyWriter\uninstall.ps1`.

This deletes the install folder, both shortcuts, and the registry entry.

### Guided walkthrough

A 6-step tour opens automatically the first time you launch. Reopen it anytime
from the **?** icon in the top bar.

## LLM integrations (switchable — free options available)

SkyWriter needs **two** model calls: multimodal **text** (reads ingredient images, writes
copy) and **image** generation (renders using livery/logo as references). Both are
**switchable in ⚙ Settings** — choose text and image engines independently:

| Slot | Local & free | Hosted & free | Paid / best |
|---|---|---|---|
| Text | **Ollama** (`gemma3:4b`) | **Groq** | Gemini `gemini-2.5-flash` |
| Image _(🚧 disabled)_ | **SD WebUI / Forge** | **Pollinations.ai** | Gemini `gemini-2.5-flash-image-preview` |

The default text engine is the **fully-local, $0** Ollama stack. Image generation is
currently **under development and disabled in the UI**. See
[FREE-MODELS.md](FREE-MODELS.md) for one-time install/setup commands.

Provider code lives in [`src/lib/text.ts`](src/lib/text.ts),
[`src/lib/image.ts`](src/lib/image.ts), and [`src/lib/config.ts`](src/lib/config.ts).
Note an **image-output** model is required for renders — a plain text/chat model can't
make images. Reference-fidelity (matching your exact logo/livery) is best on Gemini,
good on local SD with IP-Adapter, and approximate on plain img2img / Pollinations.
