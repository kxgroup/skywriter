const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#0a0f1a",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    title: "SkyWriter",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Local-only desktop tool: disabling webSecurity lets the renderer call
      // local model servers (Ollama :11434, SD WebUI :7860) and hosted APIs
      // (Groq, Pollinations, Gemini) without cross-origin (CORS) errors.
      webSecurity: false,
    },
  });

  // No application menu — this is a kiosk-style single-window app.
  Menu.setApplicationMenu(null);

  // Open target=_blank / external links (e.g. the API-key link) in the real browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  // In dev you can run `npm run dev` separately and point here; by default we
  // load the production build so the packaged .exe is self-contained.
  const devUrl = process.env.SKYWRITER_DEV_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
