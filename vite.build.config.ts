import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const nm = path.resolve(
  rootDir,
  "../htrgr/REPLIT-LATEST/HTRGroupLLC1/artifacts/appliance-repair/node_modules",
);

export default defineConfig({
  base: "/",
  root: rootDir,
  plugins: [react(), tailwindcss()],
  resolve: {
    modules: [nm, "node_modules"],
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(rootDir, "dist-build"),
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(rootDir, "index.html"),
      output: {
        entryFileNames: "assets/index-utf8-v4.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (info) => {
          const n = info.names?.[0] ?? "";
          if (n.endsWith(".css")) return "assets/index-_bdQPowM.css";
          return "assets/[name][extname]";
        },
      },
    },
  },
});
