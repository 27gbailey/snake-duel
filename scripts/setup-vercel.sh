#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.tools/node-v22.16.0-darwin-x64/bin:${PATH:-}"

REPO="27gbailey/snake-duel"
IMPORT_URL="https://vercel.com/new/import?s=https://github.com/${REPO}"

echo "Slice & Serve — Vercel setup"
echo ""
echo "Option A (recommended): GitHub import in the browser"
echo "  1. Open: ${IMPORT_URL}"
echo "  2. Sign in to Vercel with GitHub (account: 27gbailey)"
echo "  3. Import repository: snake-duel"
echo "  4. Keep defaults:"
echo "       Framework Preset: Next.js"
echo "       Build Command:    npm run build"
echo "       Install Command:  npm install"
echo "       Output Directory: (leave empty)"
echo "  5. Do NOT set GITHUB_PAGES=true — that is only for GitHub Pages."
echo "  6. Click Deploy"
echo ""
echo "After the first deploy, every push to main auto-deploys."
echo ""
echo "Option B: Vercel CLI"
echo "  npm install"
echo "  npx vercel login"
echo "  npx vercel link"
echo "  npm run vercel:preview   # preview URL"
echo "  npm run vercel:deploy    # production"
echo ""

if command -v open >/dev/null 2>&1; then
  read -r -p "Open Vercel import page in browser now? [Y/n] " reply
  reply="${reply:-Y}"
  if [[ "$reply" =~ ^[Yy]$ ]]; then
    open "$IMPORT_URL"
  fi
fi
