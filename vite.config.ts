import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        newtab: resolve(__dirname, "newTab.html"),
        background: resolve(__dirname, "./src/background.ts"),
      },
      output: {
        format: "esm",
        dir: "dist",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") return "background.js";
          return "[name]-[hash].js";
        },
        manualChunks: {
          highcharts: ["highcharts"],
          "highchart-react": ["highcharts-react-official"],
          daisy: ["daisyui"],
          "react-hot-toast": ["react-hot-toast"],
          "tailwind-merge": ["tailwind-merge"],
          zustand: ["zustand"],
          react: ["react", "react-router-dom"],
          clsx: ["clsx"],
        },
      },
    },
    sourcemap: process.env.NODE_ENV === "development",
  },
});
