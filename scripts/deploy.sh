#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.tools/node-v22.16.0-darwin-x64/bin:${PATH:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Install Node 22+ or run from a machine with npm available."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  export PATH="$ROOT/.tools/gh_2.74.2_macOS_amd64/bin:$PATH"
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub login required. Complete the browser flow:"
  gh auth login --hostname github.com --git-protocol ssh --web
fi

REPO_NAME="${1:-snake-duel}"
OWNER="$(gh api user -q .login)"

if ! gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "git@github.com:$OWNER/$REPO_NAME.git"
  git push -u origin main
fi

gh api "repos/$OWNER/$REPO_NAME/pages" \
  -X POST \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/ 2>/dev/null || true

echo ""
echo "Deployment started."
echo "Live URL: https://$OWNER.github.io/$REPO_NAME/"
echo "Track progress: https://github.com/$OWNER/$REPO_NAME/actions"
