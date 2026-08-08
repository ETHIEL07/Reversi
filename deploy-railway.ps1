#!/usr/bin/env pwsh
param()

Write-Host "Reversi -> Railway Deployment" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Railway CLI
Write-Host "Step 1: Checking Railway CLI..." -ForegroundColor Yellow
try {
  $output = & railway --version 2>&1
  Write-Host "OK - Railway CLI installed" -ForegroundColor Green
} catch {
  Write-Host "ERROR - Railway CLI not found. Run: npm install -g @railway/cli" -ForegroundColor Red
  exit 1
}

# Step 2: Check authentication
Write-Host "Step 2: Checking Railway authentication..." -ForegroundColor Yellow
try {
  $whoami = & railway whoami 2>&1
  Write-Host "OK - Authenticated as: $whoami" -ForegroundColor Green
} catch {
  Write-Host "Need to login. Opening Railway..." -ForegroundColor Yellow
  Start-Process "https://railway.app/login"
  Write-Host "Please login with GitHub and run this script again" -ForegroundColor Cyan
  exit 0
}

# Step 3: Create project
Write-Host "Step 3: Creating Railway project..." -ForegroundColor Yellow
$projectName = "reversi-$(Get-Random -Maximum 99999)"
& railway init --project-name $projectName 2>&1 | Out-Null
Write-Host "OK - Project: $projectName" -ForegroundColor Green

# Step 4: Link GitHub repo
Write-Host "Step 4: Linking GitHub repository..." -ForegroundColor Yellow
& railway link ETHIEL07/Reversi 2>&1 | Out-Null
Write-Host "OK - GitHub linked" -ForegroundColor Green

# Step 5: Add database
Write-Host "Step 5: Adding PostgreSQL..." -ForegroundColor Yellow
& railway add --type postgres 2>&1 | Out-Null
Write-Host "OK - Database added" -ForegroundColor Green

# Step 6: Configure env
Write-Host "Step 6: Setting environment..." -ForegroundColor Yellow
& railway variables set ASPNETCORE_ENVIRONMENT=Production 2>&1 | Out-Null
Write-Host "OK - Environment configured" -ForegroundColor Green

# Step 7: Deploy
Write-Host "Step 7: Deploying..." -ForegroundColor Yellow
& railway up 2>&1 | Out-Null
Write-Host "OK - Deployment started" -ForegroundColor Green

# Step 8: Wait for API
Write-Host "Step 8: Waiting for API online..." -ForegroundColor Yellow
$maxTries = 30
$tries = 0
while ($tries -lt $maxTries) {
  try {
    $resp = Invoke-WebRequest "https://reversi-api.railway.app/api/version" -TimeoutSec 3 -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
      Write-Host "OK - API is online!" -ForegroundColor Green
      break
    }
  } catch {
    $tries++
    Start-Sleep -Seconds 2
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS - Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "API:      https://reversi-api.railway.app" -ForegroundColor Cyan
Write-Host "Frontend: https://reversi-psi-two.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test: Visit frontend, click Jouer, Nouvelle partie, Ordinateur" -ForegroundColor White
Write-Host ""
