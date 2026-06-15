$ErrorActionPreference = "Stop"

Write-Host "[1/4] Locale routes smoke"
$routes = @(
  "http://localhost:3001/fa",
  "http://localhost:3001/en",
  "http://localhost:3001/ar",
  "http://localhost:3001/fa/about",
  "http://localhost:3001/en/services",
  "http://localhost:3001/ar/gallery"
)

foreach ($route in $routes) {
  $status = (Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 30).StatusCode
  Write-Host "$route => $status"
}

Write-Host "[2/4] Mailpit email smoke"
$emailStatus = (Invoke-WebRequest -Uri "http://localhost:3001/api/dev/staff-email-smoke" -Method Post -UseBasicParsing -TimeoutSec 30).StatusCode
Write-Host "staff-email-smoke => $emailStatus"

$mailpitMessages = Invoke-WebRequest -Uri "http://localhost:8025/api/v1/messages" -UseBasicParsing -TimeoutSec 30
Write-Host "mailpit messages endpoint => $($mailpitMessages.StatusCode)"

Write-Host "[3/4] OTP mock flow smoke"
$phone = "+989121112233"

$registerPayload = @{ json = @{ phoneNumber = $phone; password = "NewPass123!"; confirmPassword = "NewPass123!" } } | ConvertTo-Json -Depth 5
try {
  $registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/trpc/auth.registerPatient" -Method Post -ContentType "application/json" -Body $registerPayload -UseBasicParsing -TimeoutSec 30
  Write-Host "register patient => $($registerResponse.StatusCode)"
} catch {
  Write-Host "register patient => skipped (possibly already exists)"
}

$forgotBody = @{ phoneNumber = $phone } | ConvertTo-Json
$forgotStatus = (Invoke-WebRequest -Uri "http://localhost:3001/api/auth/password/forgot" -Method Post -ContentType "application/json" -Body $forgotBody -UseBasicParsing -TimeoutSec 30).StatusCode
Write-Host "forgot => $forgotStatus"

$otpResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/password/mock-otp?phoneNumber=$([uri]::EscapeDataString($phone))" -UseBasicParsing -TimeoutSec 30
$otpJson = $otpResponse.Content | ConvertFrom-Json

$resetBody = @{
  phoneNumber = $phone
  otpCode = $otpJson.otpCode
  newPassword = "NewPass123!"
  confirmNewPassword = "NewPass123!"
} | ConvertTo-Json

$resetStatus = (Invoke-WebRequest -Uri "http://localhost:3001/api/auth/password/reset" -Method Post -ContentType "application/json" -Body $resetBody -UseBasicParsing -TimeoutSec 30).StatusCode
Write-Host "reset => $resetStatus"

Write-Host "[4/4] Login lockout smoke"
$bad = @{ identifier = "admin"; password = "WrongPass123!" } | ConvertTo-Json
$statuses = @()
1..8 | ForEach-Object {
  try {
    $status = (Invoke-WebRequest -Uri "http://localhost:3001/api/auth/session/login" -Method Post -ContentType "application/json" -Body $bad -UseBasicParsing -TimeoutSec 30).StatusCode
    $statuses += [string]$status
  } catch {
    if ($_.Exception.Response) {
      $statuses += [string][int]$_.Exception.Response.StatusCode
    } else {
      throw
    }
  }
}
Write-Host "login statuses => $($statuses -join ', ')"

Write-Host "Smoke tests completed."
