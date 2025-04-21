# Script to verify all setup and dependencies are correctly in place

Write-Host "Verifying BloodFest project setup..." -ForegroundColor Cyan

# Verify Node.js and npm
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js or npm not found. Please install Node.js v18 or higher." -ForegroundColor Red
    exit
}

# Verify frontend dependencies
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
if (!(Test-Path -Path .\node_modules)) {
    Write-Host "Warning: Frontend dependencies not installed. Installing now..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Frontend dependencies found." -ForegroundColor Green
}

# Verify backend dependencies
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
if (!(Test-Path -Path .\backend\node_modules)) {
    Write-Host "Warning: Backend dependencies not installed. Installing now..." -ForegroundColor Yellow
    Set-Location -Path .\backend
    npm install
    Set-Location -Path ..
} else {
    Write-Host "Backend dependencies found." -ForegroundColor Green
}

# Verify TypeScript
Write-Host "Checking TypeScript files..." -ForegroundColor Yellow
if (!(Test-Path -Path .\fix-typescript.ps1)) {
    Write-Host "Error: fix-typescript.ps1 script not found." -ForegroundColor Red
} else {
    # Run TypeScript fix script to ensure imports are correct
    Write-Host "Running TypeScript fixes..." -ForegroundColor Yellow
    powershell -File .\fix-typescript.ps1
}

# Verify backend setup
Write-Host "Checking backend configuration..." -ForegroundColor Yellow
$packageJson = Get-Content -Path .\backend\package.json -Raw | ConvertFrom-Json
if ($packageJson.type -ne "module") {
    Write-Host "Error: Backend package.json is not configured for ES modules. Running fixes..." -ForegroundColor Red
    powershell -File .\fix-typescript.ps1
} else {
    Write-Host "Backend ES module configuration looks good." -ForegroundColor Green
}

# Verify .env file
if (!(Test-Path -Path .\backend\.env)) {
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    @"
PORT=3001
JWT_SECRET=your_secret_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:5175
# Uncomment to use a real MongoDB instance
# MONGODB_URI=mongodb://localhost:27017/bloodfest
"@ | Set-Content -Path .\backend\.env
}

Write-Host "Setup verification complete!" -ForegroundColor Cyan
Write-Host "To start the application, run: npm run dev" -ForegroundColor Cyan 