import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite"; // 🚀 1. 임포트 추가

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 🚀 2. AutoImport 설정 추가
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      dirs: ["./src/utils"], // overlay.js가 있는 폴더
      vueTemplate: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
