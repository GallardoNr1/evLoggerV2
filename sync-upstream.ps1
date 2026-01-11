# -----------------------------
# Sync from upstream main
# Without contributors
# With safety check (clean working tree)
# -----------------------------

# Safety: stop if there are uncommitted changes
$dirty = git status --porcelain
if ($dirty) {
  Write-Error "❌ Working tree NOT clean. Commit or stash your changes first."
  git status
  exit 1
}

Write-Host "✅ Working tree clean"

Write-Host "🔄 Fetching upstream..."
git fetch upstream
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Error fetching upstream"
  exit 1
}

Write-Host "📂 Syncing files from upstream/main..."
git checkout upstream/main -- .
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Error checking out files from upstream/main"
  exit 1
}

git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMessage = "chore: sync from upstream ($timestamp)"

git commit -m "$commitMessage"
if ($LASTEXITCODE -ne 0) {
  Write-Host "ℹ️ Nothing to commit (no changes)."
  exit 0
}

Write-Host "🚀 Pushing to origin..."
git push origin main
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Push failed"
  exit 1
}

Write-Host "✅ Sync completed: $commitMessage"
