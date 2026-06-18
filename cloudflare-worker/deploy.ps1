# Deploy wallet secureproxy worker (replaces y2xQg8Wo.php)
#
# Prerequisites:
#   1. Cloudflare email verified: https://dash.cloudflare.com/profile
#   2. npx wrangler login
#   3. cloudflare-worker/.dev.vars exists with KEY_EVM and KEY_SOL
#
# Usage (PowerShell):
#   cd cloudflare-worker
#   .\deploy.ps1

$ErrorActionPreference = "Stop"

function Write-SecretsFromDevVars {
  if (-not (Test-Path ".dev.vars")) {
    throw ".dev.vars not found. Copy keys from y2xQg8Wo.php into .dev.vars"
  }

  $content = Get-Content ".dev.vars" -Raw
  if ($content -notmatch 'KEY_EVM="([\s\S]*?)"\s*KEY_SOL="([\s\S]*?)"\s*$') {
    throw "Could not parse KEY_EVM / KEY_SOL from .dev.vars"
  }

  $secrets = [ordered]@{
    KEY_EVM = $Matches[1]
    KEY_SOL = $Matches[2]
  }

  $jsonPath = Join-Path $PWD "secrets.bulk.json"
  $secrets | ConvertTo-Json -Compress | Set-Content -Encoding utf8 $jsonPath

  Write-Host "Uploading KEY_EVM and KEY_SOL to Cloudflare..." -ForegroundColor Cyan
  npx wrangler secret bulk $jsonPath
  Remove-Item $jsonPath
}

Write-Host "Checking KV namespace..." -ForegroundColor Cyan
if ((Get-Content wrangler.toml -Raw) -match 'id = "00000000000000000000000000000000"') {
  $kv = npx wrangler kv namespace create PROXY_CACHE 2>&1 | Out-String
  if ($kv -match 'id = "([a-f0-9]+)"') {
    $id = $Matches[1]
    Write-Host "KV namespace id: $id" -ForegroundColor Green
    (Get-Content wrangler.toml) -replace 'id = "00000000000000000000000000000000"', "id = `"$id`"" | Set-Content wrangler.toml
  }
} else {
  Write-Host "KV namespace already configured in wrangler.toml" -ForegroundColor Green
}

Write-SecretsFromDevVars

Write-Host "Deploying worker..." -ForegroundColor Cyan
npx wrangler deploy
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Deploy failed." -ForegroundColor Red
  Write-Host "If you see 'verify your email address' (code 10034):" -ForegroundColor Yellow
  Write-Host "  1. Open https://dash.cloudflare.com/profile"
  Write-Host "  2. Verify your email, then run .\deploy.ps1 again"
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Deployed successfully." -ForegroundColor Green
Write-Host "Worker URL:" -ForegroundColor Green
Write-Host "  https://wallet-secureproxy.1215a5sd9.workers.dev/secureproxy"
Write-Host ""
Write-Host "Test:" -ForegroundColor Yellow
Write-Host '  curl "https://wallet-secureproxy.1215a5sd9.workers.dev/secureproxy?e=ping_proxy"'
Write-Host ""
Write-Host "Then update vercel.json with your real workers.dev URL and push to GitHub."
