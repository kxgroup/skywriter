import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built app loads correctly from Electron's file:// protocol.
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
