import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;

          // React 核心 — 每个页面都需要
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/@tanstack/react-query")
          ) {
            return "vendor-react";
          }

          // Markdown 渲染全家桶 — 仅文章详情页需要（含 unified/remark/rehype/hast/mdast/highlight）
          if (
            id.includes("/react-markdown") ||
            id.includes("/remark-") ||
            id.includes("/rehype-") ||
            id.includes("/unified") ||
            id.includes("/mdast-util") ||
            id.includes("/hast-util") ||
            id.includes("/hastscript") ||
            id.includes("/unist-util") ||
            id.includes("/micromark") ||
            id.includes("/lowlight") ||
            id.includes("/highlight.js") ||
            id.includes("/hast-util-") ||
            id.includes("/mdast-util-") ||
            id.includes("/property-information") ||
            id.includes("/space-separated-tokens") ||
            id.includes("/comma-separated-tokens") ||
            id.includes("/decode-named-character-reference") ||
            id.includes("/stringify-entities") ||
            id.includes("/trim-lines") ||
            id.includes("/bail") ||
            id.includes("/is-plain-obj") ||
            id.includes("/trough") ||
            id.includes("/vfile") ||
            id.includes("/zwitch")
          ) {
            return "vendor-markdown";
          }

          // 图标库
          if (id.includes("/lucide-react")) return "vendor-icons";
        },
        // 其余 node_modules 让 Vite 按需拆分，随对应页面 lazy-load
      },
    },
  },
});
