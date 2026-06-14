import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/snake-duel" : "",
  assetPrefix: isGitHubPages ? "/snake-duel/" : undefined,
};

export default nextConfig;
