#!/usr/bin/env bash
set -e

# --- Make git fully non-interactive ---
export GIT_EDITOR=true
export GIT_TERMINAL_PROMPT=0

echo "🔍 Checking working tree..."
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Working tree NOT clean. Commit or stash your changes first."
  git status
  exit 1
fi

echo "✅ Working tree clean"

echo "🔄 Fetching upstream..."
git fetch upstream --quiet

echo "📂 Syncing files from upstream/main..."
git checkout -f upstream/main -- .

git add .

TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
COMMIT_MSG="chore: sync from upstream ($TIMESTAMP)"

# If no changes, exit cleanly
if git diff --cached --quiet; then
  echo "ℹ️ Nothing to commit"
  exit 0
fi

echo "💾 Creating commit..."
git commit -m "$COMMIT_MSG" --no-edit

echo "🚀 Pushing to origin..."
git push origin main --quiet

echo "✅ Sync completed: $COMMIT_MSG"
