export default function Manual() {
  return (
    <div className="panel manual">
      <h2>Operations Manual</h2>
      <p className="muted">
        A complete, from-scratch guide. SkyWriter is designed to run <b>fully local and
        free</b> — no accounts, no cloud, no per-use limits, works offline. Follow the
        sections in order and you'll be writing press releases on your own machine.
      </p>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>0 · What SkyWriter is &amp; what you need</h3>
        <p>
          SkyWriter is a PR &amp; marketing-copy generator for virtual airlines. It uses an
          AI <b>text engine</b> to write press releases (and to read any images you attach).
          A separate <b>image engine</b> renders marketing pictures.
        </p>
        <p className="warn small">
          🚧 <b>Image generation is currently under development and disabled.</b> The Visual
          Assets tab opens with a notice and its controls are greyed out. Everything else —
          profiles, press releases, the timeline, export/import — works fully.
        </p>
        <p>
          <b>To use SkyWriter you only need one thing: a local text engine.</b> The
          recommended (and default) engine is <b>Ollama</b>, which runs open-weight AI models
          directly on your computer at <b>zero cost</b> and with full privacy. Set it up once
          in section 1.
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>1 · First-time setup — Ollama (local, free, recommended)</h3>
        <p>
          Ollama is a small background service that runs AI models on your own hardware. A PC
          with a dedicated GPU is ideal, but modern CPUs work too. One-time setup:
        </p>
        <ol>
          <li>
            <b>Install Ollama</b> from{" "}
            <a href="https://ollama.com/download" target="_blank" rel="noreferrer">
            ollama.com/download</a> (or run <code>winget install Ollama.Ollama</code>).
          </li>
          <li>
            Installing it <b>automatically starts a background service</b> (you'll see it in
            the system tray). <b>Do not run <code>ollama serve</code> yourself</b> — it's
            already running, and doing so throws a "port already in use" error.
          </li>
          <li>
            <b>Pull a vision-capable model</b> (vision lets the AI read images you attach to a
            press release):
            <br />
            <code>ollama pull gemma3:4b</code>{" "}
            <span className="muted small">— ~3 GB, the tested default, fast and light.</span>
            <br />
            <span className="muted small">
              Alternatives: <code>qwen2.5vl:7b</code>, <code>llava:7b</code>. Avoid{" "}
              <code>llama3.2-vision</code> — it fails to load on some builds.
            </span>
          </li>
          <li>
            <b>Allow SkyWriter to call Ollama</b> (one time), then restart Ollama from the
            tray:
            <br />
            <code>setx OLLAMA_ORIGINS "*"</code>
          </li>
          <li>
            In SkyWriter, open the <b>⚙ gear</b> → <b>Text engine → Ollama</b>. Set model{" "}
            <code>gemma3:4b</code> and URL <code>http://127.0.0.1:11434</code>. Click{" "}
            <b>Save</b>.
          </li>
        </ol>
        <p className="muted small">
          <b>Verify it's running:</b> <code>ollama list</code> shows your models, and{" "}
          <code>(Invoke-RestMethod http://127.0.0.1:11434/api/version).version</code> prints a
          version number. The top bar shows <code>ollama · …</code>; a <b>⚠ setup</b> badge
          there means the model/URL still needs attention.
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>2 · Profiles — create your airline</h3>
        <p>
          Open the <b>Profiles</b> tab and fill in your airline identity: <b>name</b>,{" "}
          <b>ICAO code</b>, <b>vibe/tone</b>, <b>fleet</b>, <b>hubs</b>,{" "}
          <b>destinations</b>, <b>cabin specs</b>, and brand assets (<b>livery</b>,{" "}
          <b>logo</b>, <b>alliance</b>). The more you fill in, the more on-brand the AI copy
          becomes — the text engine reads these fields on every generation.
        </p>
        <ul>
          <li>Use the <b>dropdown</b> at the top to keep several airlines and switch between them.</li>
          <li>
            Brand images (livery/logo) are uploaded from your device and stored with the
            profile (used by the currently-disabled image engine).
          </li>
        </ul>
        <p className="warn small">
          ⚠ All data lives in memory only and is <b>cleared when you close the app/tab</b>.
          Use <b>Export</b> often to save a <code>.json</code> backup, and <b>Import</b> to
          restore it later. The amber banner at the top is your reminder when you have unsaved
          work.
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>3 · Press Releases — the main workflow</h3>
        <ol>
          <li>Make sure the right airline is selected (Profiles dropdown).</li>
          <li>
            Choose a <b>topic</b> (e.g. new route, fleet news, emergency update), an{" "}
            <b>output purpose</b> (press release, social post, internal memo…), and a{" "}
            <b>length</b>.
          </li>
          <li>Write a short <b>brief</b> describing what happened or what to announce.</li>
          <li>
            Optionally attach <b>ingredient images</b> — the AI analyses them for concrete
            detail (this is why a <i>vision-capable</i> model like <code>gemma3:4b</code> is
            recommended in section 1).
          </li>
          <li>
            Toggle <b>hard limits</b> for strict word/character caps — useful for social posts
            with a fixed length.
          </li>
          <li>Click <b>generate</b>. The result appears here and is filed into the Timeline.</li>
        </ol>
        <p>
          <b>Context chaining:</b> after generating, the new piece becomes the active{" "}
          <i>chain</i>. Generate again (or select a node in the Timeline and press{" "}
          <i>chain</i>) to keep a multi-part story or rolling emergency update consistent with
          what came before. Press <i>release</i> to drop the chain and start fresh.
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>4 · Visual Assets <span className="warn small">(under development)</span></h3>
        <p>
          This tab will render 16:9 marketing photos from a scene description, feeding your{" "}
          <b>livery</b> and <b>logo</b> to an image model as visual references.{" "}
          <b>It is temporarily disabled</b> — opening the tab shows a notice and the controls
          are greyed out. When it returns, the recommended local image engine will be{" "}
          <b>Stable Diffusion WebUI / Forge</b> (free, runs on your GPU). No action is needed
          from you for now.
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>5 · Timeline Explorer</h3>
        <p>
          Every generation is filed into a collapsible thread tree on the right. From there
          you can <b>copy</b> text, <b>download</b> images, and <b>activate or release</b> a
          chain link without leaving the page. It's your running history for the session
          (remember: it clears on close — export anything you want to keep).
        </p>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>6 · Tools &amp; housekeeping</h3>
        <ul>
          <li><b>Export Project</b> (top bar) — bundles the app source into a ZIP for local dev/hosting.</li>
          <li><b>⚙ gear</b> — choose your text/image providers.</li>
          <li><b>?</b> icon — reopens the guided walkthrough tour.</li>
          <li><b>Export / Import profiles</b> — your save/restore for all airline data.</li>
          <li>The <b>amber banner</b> warns you when there's unsaved work in memory.</li>
        </ul>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>7 · Troubleshooting (local setup)</h3>
        <ul>
          <li>
            <b>⚠ setup badge in the top bar</b> — Ollama's URL or model isn't set. Reopen ⚙
            and confirm <code>http://127.0.0.1:11434</code> and a pulled model name.
          </li>
          <li>
            <b>"Connection refused" / nothing generates</b> — Ollama isn't running. Check the
            tray icon; verify with <code>ollama list</code>. Don't run{" "}
            <code>ollama serve</code> manually.
          </li>
          <li>
            <b>CORS or blocked-request errors</b> — you skipped{" "}
            <code>setx OLLAMA_ORIGINS "*"</code>, or didn't restart Ollama afterwards.
          </li>
          <li>
            <b>Attached images seem ignored</b> — your model isn't vision-capable. Use{" "}
            <code>gemma3:4b</code>, <code>qwen2.5vl:7b</code>, or <code>llava:7b</code>.
          </li>
          <li>
            <b>Model fails to load</b> (e.g. <code>unknown model architecture: 'mllama'</code>)
            — switch off <code>llama3.2-vision</code> to one of the models above.
          </li>
          <li>
            <b>Everything disappeared after closing</b> — data is in-memory only. Always{" "}
            <b>Export</b> before closing.
          </li>
        </ul>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className="card">
        <h3>Footnote · Online providers (optional, not required)</h3>
        <p className="muted small">
          SkyWriter is built to run fully locally with Ollama, and that's the recommended
          path. If you ever can't run a local model, the <b>⚙ gear</b> also offers optional
          cloud text engines that need an account/API key:
        </p>
        <ul className="muted small">
          <li>
            <b>Groq</b> — free hosted, fast. Make a key at <code>console.groq.com</code>, paste
            it into ⚙ → Text engine → Groq, and set a current (vision) model id from{" "}
            <code>console.groq.com/docs/models</code>.
          </li>
          <li>
            <b>Google Gemini</b> — strong quality; paid or limited free tier. Needs a Google AI
            Studio key.
          </li>
        </ul>
        <p className="muted small">
          These are conveniences only — none are needed for normal, local use.
        </p>
      </section>
    </div>
  );
}
