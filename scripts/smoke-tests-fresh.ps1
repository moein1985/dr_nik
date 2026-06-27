$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3001"

Write-Host "[1/6] Fresh Feed page smoke"
$freshStatus = (Invoke-WebRequest -Uri "$baseUrl/fa/fresh" -UseBasicParsing -TimeoutSec 30).StatusCode
Write-Host "  /fa/fresh => $freshStatus"

Write-Host "[2/6] Fresh Feed tRPC list query smoke"
$listBody = '{}'
$listResponse = Invoke-WebRequest -Uri "$baseUrl/api/trpc/fresh.list" -Method Get -UseBasicParsing -TimeoutSec 30
Write-Host "  fresh.list => $($listResponse.StatusCode)"
$listJson = $listResponse.Content | ConvertFrom-Json
if ($listJson.result.data) {
    $postCount = $listJson.result.data.Count
    Write-Host "  posts returned => $postCount"
} else {
    Write-Host "  posts returned => 0 (empty feed)"
}

Write-Host "[3/6] Fresh Feed toggleLike without auth (should fail)"
$likeBody = '{"postId":"00000000-0000-0000-0000-000000000000"}'
try {
    $likeResponse = Invoke-WebRequest -Uri "$baseUrl/api/trpc/fresh.toggleLike" -Method Post -ContentType "application/json" -Body $likeBody -UseBasicParsing -TimeoutSec 30
    Write-Host "  toggleLike (no auth) => $($likeResponse.StatusCode) (unexpected success)"
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "  toggleLike (no auth) => $statusCode (expected: 401)"
}

Write-Host "[4/6] Fresh Feed addComment without auth (should fail)"
$commentBody = '{"postId":"00000000-0000-0000-0000-000000000000","content":"test"}'
try {
    $commentResponse = Invoke-WebRequest -Uri "$baseUrl/api/trpc/fresh.addComment" -Method Post -ContentType "application/json" -Body $commentBody -UseBasicParsing -TimeoutSec 30
    Write-Host "  addComment (no auth) => $($commentResponse.StatusCode) (unexpected success)"
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "  addComment (no auth) => $statusCode (expected: 401)"
}

Write-Host "[5/6] Upload endpoint smoke (no file)"
try {
    $uploadResponse = Invoke-WebRequest -Uri "$baseUrl/api/upload" -Method Post -UseBasicParsing -TimeoutSec 30
    Write-Host "  upload (no file) => $($uploadResponse.StatusCode) (unexpected success)"
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "  upload (no file) => $statusCode (expected: 400)"
}

Write-Host "[6/6] Fresh Feed getById with invalid UUID (should fail)"
try {
    $getByIdResponse = Invoke-WebRequest -Uri "$baseUrl/api/trpc/fresh.getById?input=%7B%22id%22%3A%22invalid%22%7D" -UseBasicParsing -TimeoutSec 30
    Write-Host "  getById (invalid uuid) => $($getByIdResponse.StatusCode) (unexpected success)"
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "  getById (invalid uuid) => $statusCode (expected: 400)"
}

Write-Host "Fresh Feed smoke tests completed."
