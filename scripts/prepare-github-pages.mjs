import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const indexPath = join(outDir, "index.html");

if (!existsSync(indexPath)) {
  console.error("Missing out/index.html — run npm run build first.");
  process.exit(1);
}

copyFileSync(indexPath, join(outDir, "404.html"));
console.log("Copied out/index.html to out/404.html for GitHub Pages SPA fallback.");
