param(
    [string]$RemoteUrl = "",
    [string]$Branch = "main",
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path .).Path
$gitDir = Join-Path $repoRoot '.git'
$gitIgnore = Join-Path $repoRoot '.gitignore'

Write-Host "Repository root: $repoRoot" -ForegroundColor Cyan
Write-Host "Current branch target: $Branch" -ForegroundColor Cyan

if (-not (Test-Path $gitIgnore)) {
    throw "Missing .gitignore at $gitIgnore. Aborting to avoid accidental repo corruption."
}

Write-Host "`nThis script will:" -ForegroundColor Yellow
Write-Host "  1) remove the current corrupted .git folder from this working tree" -ForegroundColor Yellow
Write-Host "  2) create a fresh repository using the existing .gitignore" -ForegroundColor Yellow
Write-Host "  3) add all current project files (not the backup folder)" -ForegroundColor Yellow
Write-Host "  4) create an initial commit" -ForegroundColor Yellow
Write-Host "  5) optionally connect to a remote and force-push" -ForegroundColor Yellow

if (-not $Force) {
    $confirm = Read-Host "Type YES to continue (this will delete $gitDir and recreate Git history)"
    if ($confirm -ne 'YES') {
        Write-Host "Aborted by user." -ForegroundColor Red
        exit 1
    }
}

if (Test-Path $gitDir) {
    Write-Host "Removing existing .git folder..." -ForegroundColor Magenta
    Remove-Item -LiteralPath $gitDir -Recurse -Force
}

Write-Host "Initializing new Git repository..." -ForegroundColor Magenta
& git init -b $Branch
if ($LASTEXITCODE -ne 0) { throw 'git init failed.' }

Write-Host "Verifying .gitignore is present..." -ForegroundColor Magenta
if (Test-Path $gitIgnore) {
    Get-Content $gitIgnore | Write-Host
}

Write-Host "`nAdding files to the new index..." -ForegroundColor Magenta
& git add .
if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }

Write-Host "Checking for large/unwanted files that should be ignored..." -ForegroundColor Magenta
& git status --short --ignored

Write-Host "`nCreating initial commit..." -ForegroundColor Magenta
& git commit -m "Initial commit: clean repository after binary files removal"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. This usually means there is nothing to commit or Git author info is missing." -ForegroundColor Yellow
    Write-Host "If needed, configure author identity with:" -ForegroundColor Yellow
    Write-Host "  git config user.name \"Your Name\"" -ForegroundColor Yellow
    Write-Host "  git config user.email \"you@example.com\"" -ForegroundColor Yellow
    throw 'git commit failed.'
}

Write-Host "`nRepository size verification (before pushing):" -ForegroundColor Cyan
& git count-objects -vH
$objectIds = & git rev-list --objects --all | ForEach-Object { ($_ -split '\s+')[0] }
$objectIds | & git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)'

$repoSizeBytes = (Get-ChildItem -Path $repoRoot -Recurse -Force -File | Measure-Object -Property Length -Sum).Sum
Write-Host ("Estimated working tree size: {0:N2} MB" -f ($repoSizeBytes / 1MB)) -ForegroundColor Cyan
Write-Host ("Git object directory size: {0:N2} MB" -f ((Get-ChildItem -Path (Join-Path $repoRoot '.git') -Recurse -Force | Measure-Object -Property Length -Sum).Sum / 1MB)) -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
    Write-Host "`nRemote URL was not provided." -ForegroundColor Yellow
    Write-Host "To get your remote URL:" -ForegroundColor Yellow
    Write-Host "  1. Open your Git hosting site (GitHub/GitLab/Bitbucket)." -ForegroundColor Yellow
    Write-Host "  2. Open your repository page and copy the 'Clone' / 'Code' URL." -ForegroundColor Yellow
    Write-Host "  3. Re-run this script with: -RemoteUrl \"https://.../your-repo.git\"" -ForegroundColor Yellow
    Write-Host "  4. Or run this manually:" -ForegroundColor Yellow
    Write-Host "     git remote add origin <YOUR_REMOTE_URL>" -ForegroundColor Yellow
    Write-Host "     git push -u origin $Branch --force-with-lease" -ForegroundColor Yellow
    exit 0
}

Write-Host "`nAdding remote origin..." -ForegroundColor Magenta
& git remote remove origin 2>$null
& git remote add origin $RemoteUrl
if ($LASTEXITCODE -ne 0) { throw 'git remote add failed.' }

Write-Host "`nPushing to remote with force..." -ForegroundColor Magenta
& git push -u origin $Branch --force-with-lease
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. If the remote branch does not exist yet, try:" -ForegroundColor Yellow
    Write-Host "  git push -u origin HEAD:$Branch --force" -ForegroundColor Yellow
    throw 'git push failed.'
}

Write-Host "`nDone. Your clean repository is now committed and pushed." -ForegroundColor Green
