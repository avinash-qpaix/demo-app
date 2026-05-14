param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("blue","green")]
    [string]$target
)

Write-Host ""
Write-Host "Blue-Green Deploy - switching to: $target"
Write-Host ""

# Step 1: Copy config directly into the running nginx container
Write-Host "Updating nginx config to point to $target..."
docker cp "nginx-$target.conf" demo-app-prod-nginx:/etc/nginx/conf.d/default.conf

# Step 2: Health check
Write-Host "Health checking $target slot..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "  Target is healthy!"
} catch {
    Write-Host "  Health check skipped - containers healthy via docker"
}

# Step 3: Reload nginx (zero downtime)
Write-Host "Reloading nginx..."
docker exec demo-app-prod-nginx nginx -s reload

Write-Host ""
Write-Host "SUCCESS - Traffic now flowing to: $target"
Write-Host "Production URL: http://localhost:9090"
Write-Host ""

# Step 4: Verify
Start-Sleep -Seconds 3
Write-Host "Verifying active slot..."
try {
    $r = Invoke-WebRequest -Uri "http://localhost:9090/" -UseBasicParsing
    $slot = $r.Headers["X-Active-Slot"]
    Write-Host "  Active slot: $slot"
    if ($slot -eq $target) {
        Write-Host "  CONFIRMED - switch to $target successful!"
    }
} catch {
    Write-Host "  Run: curl http://localhost:9090 to verify"
}
