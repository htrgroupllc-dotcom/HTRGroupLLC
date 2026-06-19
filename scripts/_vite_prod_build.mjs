/** One-off production build for Cloudflare static deploy (Windows-friendly). */
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dentalNm = path.resolve(root, "../DentalEquipSite/node_modules");

if (!fs.existsSync(dentalNm)) {
  console.error("Missing DentalEquipSite node_modules — run pnpm install there first.");
  process.exit(1);
}

process.chdir(root);
process.env.NODE_ENV = "production";
process.env.NODE_PATH = dentalNm + path.delimiter + (process.env.NODE_PATH ?? "");

const envProdPath = path.join(root, ".env.production");
let apiBase = "https://htr-group-llc-appliance-repair.replit.app";
if (fs.existsSync(envProdPath)) {
  const m = fs.readFileSync(envProdPath, "utf8").match(/^VITE_API_BASE=(.+)$/m);
  if (m) apiBase = m[1].trim().replace(/\/$/, "");
}

const { build } = await import(pathToFileURL(path.join(dentalNm, "vite/dist/node/index.js")).href);
const react = (await import(pathToFileURL(path.join(dentalNm, "@vitejs/plugin-react/dist/index.js")).href)).default;
const tailwindcss = (await import(pathToFileURL(path.join(dentalNm, "@tailwindcss/vite/dist/index.mjs")).href)).default;

const buildHtml = path.join(root, "dist/_build_index.html");
fs.mkdirSync(path.dirname(buildHtml), { recursive: true });
const prodHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const buildHtmlContent = prodHtml
  .replace(/<script type="module" crossorigin src="\/assets\/[^"]+"[^>]*><\/script>\s*/i, "")
  .replace(/<link rel="stylesheet" crossorigin href="\/assets\/[^"]+"[^>]*>\s*/i, "")
  .replace("</body>", '    <script type="module" src="/src/main.tsx"></script>\n  </body>');
fs.writeFileSync(buildHtml, buildHtmlContent, "utf8");

const tsconfigPath = path.join(root, "tsconfig.json");
const tsconfigBackup = fs.readFileSync(tsconfigPath, "utf8");
const tsconfigPatched = tsconfigBackup
  .replace('"../../tsconfig.base.json"', '"./tsconfig.base.json"')
  .replace(/,\s*"references"\s*:\s*\[[\s\S]*?\]\s*/m, "\n");
fs.writeFileSync(tsconfigPath, tsconfigPatched, "utf8");

try {
await build({
  configFile: false,
  root,
  base: "/",
  define: {
    "import.meta.env.VITE_API_BASE": JSON.stringify(apiBase),
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react-jsx",
        target: "esnext",
        module: "esnext",
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        paths: { "@/*": ["./src/*"] },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@assets": path.join(root, "attached_assets"),
      react: path.join(dentalNm, "react"),
      "react-dom": path.join(dentalNm, "react-dom"),
      "react/jsx-runtime": path.join(dentalNm, "react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(dentalNm, "react/jsx-dev-runtime.js"),
    },
    dedupe: ["react", "react-dom"],
    modules: [dentalNm, path.join(root, "node_modules"), "node_modules"],
  },
  build: {
    outDir: path.join(root, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: buildHtml,
      output: {
        entryFileNames: "assets/index-utf8-v4.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "assets/index-_bdQPowM.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});

console.log("Build OK:", path.join(root, "dist/public/assets/index-utf8-v4.js"));
} finally {
  fs.writeFileSync(tsconfigPath, tsconfigBackup, "utf8");
}
