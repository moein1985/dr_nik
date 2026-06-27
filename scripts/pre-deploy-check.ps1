$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Pre-Deploy Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# 1. Unit tests
Write-Host "[1/4] Running unit tests..." -ForegroundColor Yellow
try {
    npm test -- --run
    Write-Host "Unit tests: PASSED" -ForegroundColor Green
} catch {
    Write-Host "Unit tests: FAILED" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# 2. TypeScript type check
Write-Host "[2/4] TypeScript type check..." -ForegroundColor Yellow
try {
    npx tsc --noEmit
    Write-Host "TypeScript check: PASSED" -ForegroundColor Green
} catch {
    Write-Host "TypeScript check: FAILED" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# 3. ESLint
Write-Host "[3/4] ESLint check..." -ForegroundColor Yellow
try {
    npx next lint
    Write-Host "ESLint: PASSED" -ForegroundColor Green
} catch {
    Write-Host "ESLint: FAILED" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# 4. Build check
Write-Host "[4/4] Build check..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Build: PASSED" -ForegroundColor Green
} catch {
    Write-Host "Build: FAILED" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "All checks PASSED. Safe to deploy." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some checks FAILED. Do NOT deploy." -ForegroundColor Red
    exit 1
}
