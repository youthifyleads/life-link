import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: "es2022",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("react-router")
            ) {
              return "vendor-react";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "vendor-i18n";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("jsbarcode") || id.includes("qrcode")) {
              return "vendor-barcode";
            }
            if (
              id.includes("@radix-ui") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "vendor-ui";
            }
            if (
              id.includes("zod") ||
              id.includes("react-hook-form") ||
              id.includes("@hookform")
            ) {
              return "vendor-forms";
            }
          }
        },
      },
    },
  },
});
