#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

# --- Make git fully non-interactive ---
$env:GIT_EDITOR = "true"
$env:GIT_TERMINAL_PROMPT = "0"

Write-Host "🔍 Checking working tree..."

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Working tree NOT clean. Commit or stash your changes first."
    git status
    exit 1
}

Write-Host "✅ Working tree clean"

Write-Host "🔄 Fetching upstream..."
git fetch upstream --quiet

Write-Host "📂 Syncing files from upstream/main..."
git checkout -f upstream/main -- .

git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = "chore: sync from upstream ($timestamp)"

# If no changes, exit cleanly
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "ℹ️ Nothing to commit"
    exit 0
}

Write-Host "💾 Creating commit..."
git commit -m $commitMsg --no-edit

Write-Host "🚀 Pushing to origin..."
git push origin main --quiet

Write-Host "✅ Sync completed: $commitMsg"
