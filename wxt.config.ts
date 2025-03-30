import { defineConfig } from "wxt";
// import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

//https://wxt.dev/guide/essentials/config/vite.html#change-vite-config
export default defineConfig({
  manifest: {
    manifest_version: 3,
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhBq6kNW/UnH7XOYNg//GhywPIOVwTHzhKFpw7hNcoYSeqtqu1zpoY02jTpwRaaYyyJzXnthXRBX5AiVcgiv9prSmBNQS6ZdQdyGj8Wji51tHwfSPmZT189Pt/MSON5fN7dye6tmZfoRkvUIKttKW3hnEQxA5BuEhgdnqT/KgQ1oEXp8pnVK72weQ0e6+7kPxC9BdE8gd3SUdbflXn7IfvE3xP4R6jxCc05AO2j6sKiLAcgYqDesXXaAwihH6daGSRrDb5CRH6VmWviWpvb6jfNDz/HJHGYX0zDYtigH2iN87TI2ziUCNHvyZJQAcSpSR3QXNpcTolfjbcLbcAVT0JQIDAQAB",
    name: "Tabsence",
    version: "1.0.1",
    description: "Organize your tabs",
    action: {
      default_popup: "index.html",
      default_icon: {
        "16": "/assets/icons/icon-16.png",
        "64": "/assets/icons/icon-16.png",
      },
    },
    permissions: ["tabs", "favicon", "storage"],
    background: {
      service_worker: "background.js",
      type: "module",
    },
    oauth2: {
      client_id:
        "505917706315-58rv2k4cna88bdv0q0q7j971do6m5pck.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    },
  },
  modules: ["@wxt-dev/module-react"],
  alias: {
    "@": resolve(__dirname, "src"),
    src: resolve(__dirname, "src"),
  },
  vite: () => ({
    worker: {
      format: "es",
    },
    lib: {
      formats: ["es"],
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          newtab: resolve(__dirname, "newTab.html"),
          background: resolve(__dirname, "entrypoints/background.ts"),
        },
        output: {
          format: "esm",
          dir: "dist",
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === "background") return "background.js";
            return "[name]-[hash].js";
          },
          inlineDynamicImports: false,
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
  }),
});
