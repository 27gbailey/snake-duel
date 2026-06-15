import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const indexPath = join(outDir, "index.html");

if (!existsSync(indexPath)) {
  console.error("Missing out/index.html — run npm run build first.");
  process.exit(1);
}

copyFileSync(indexPath, join(outDir, "404.html"));

const versionInfo = {
  arena: process.env.ARENA_VERSION ?? "free-move-v10",
  build: process.env.NEXT_PUBLIC_BUILD_ID ?? "local",
  builtAt: new Date().toISOString(),
};

writeFileSync(
  join(outDir, "version.json"),
  JSON.stringify(versionInfo, null, 2),
);

console.log("Copied out/index.html to out/404.html for GitHub Pages SPA fallback.");
console.log(`Published version.json: ${versionInfo.arena} (${versionInfo.build})`);
