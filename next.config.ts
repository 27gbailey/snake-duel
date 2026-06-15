import type { NextConfig } from "next";

const repo = "snake-duel";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(isGitHubPages && {
    basePath: `/${repo}`,
    assetPrefix: `/${repo}/`,
  }),
};

export default nextConfig;
