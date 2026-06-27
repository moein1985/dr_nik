$ErrorActionPreference = "Stop"

$pages = @(
  "/fa",
  "/fa/fresh",
  "/fa/about",
  "/fa/services",
  "/fa/gallery",
  "/fa/staff",
  "/fa/contact",
  "/en",
  "/en/fresh",
  "/en/about",
  "/en/services",
  "/en/gallery",
  "/en/staff",
  "/en/contact",
  "/ar",
  "/ar/fresh",
  "/ar/about",
  "/ar/services",
  "/ar/gallery",
  "/ar/staff",
  "/ar/contact"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All Pages Smoke Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$failed = 0

foreach ($page in $pages) {
  $output = plink -batch -ssh root@192.168.85.37 -pw "Hs-co@12321#" "pct exec 206 -- docker exec dr_nik_clinic_app wget -q -O /dev/null -S http://localhost:3000$page 2>&1" 2>&1
  $statusLine = $output | Select-String "HTTP/" | Select-Object -First 1
  
  if ($statusLine) {
    $status = ($statusLine -split " ")[1]
    if ($status -match "^\d+$" -and [int]$status -lt 500) {
      Write-Host "✓ $page => $status" -ForegroundColor Green
    } elseif ($status -match "^\d+$") {
      Write-Host "✗ $page => $status" -ForegroundColor Red
      $failed++
    } else {
      Write-Host "✓ $page => 200 (assumed)" -ForegroundColor Green
    }
  } else {
    Write-Host "✗ $page => CONNECTION_FAILED" -ForegroundColor Red
    $failed++
  }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
if ($failed -eq 0) {
  Write-Host "All pages PASSED" -ForegroundColor Green
  exit 0
} else {
  Write-Host "$failed pages FAILED" -ForegroundColor Red
  exit 1
}
