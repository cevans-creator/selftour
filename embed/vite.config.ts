import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [react(), cssInjectedByJs()],
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "KeySherpaEmbed",
      formats: ["iife"],
      fileName: () => "embed.js",
    },
    outDir: "../public",
    emptyOutDir: false,
    rollupOptions: {
      // Bundle everything — no externals
    },
  },
});
