# Setup script to install dependencies and prepare the project

Write-Host "Setting up BloodFest project..." -ForegroundColor Cyan

# Clean up JavaScript files that conflict with TypeScript
if (Test-Path -Path .\cleanup.ps1) {
    Write-Host "Cleaning up JavaScript files..." -ForegroundColor Yellow
    powershell -File .\cleanup.ps1
}

# Apply comprehensive TypeScript ESM fixes
if (Test-Path -Path .\fix-typescript.ps1) {
    Write-Host "Fixing TypeScript module issues..." -ForegroundColor Yellow
    powershell -File .\fix-typescript.ps1
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
npm install

# Install backend dependencies 
Write-Host "Installing backend dependencies..." -ForegroundColor Green
Set-Location -Path .\backend
npm install ts-node-dev@latest rimraf@latest ts-node@latest typescript@latest --save-dev
npm install

# Build backend TypeScript files
Write-Host "Building backend..." -ForegroundColor Green
npm run build

# Return to root directory
Set-Location -Path ..

Write-Host "Setup complete! Run 'npm run dev' to start the application." -ForegroundColor Cyan
Write-Host "The application will be available at http://localhost:5175" -ForegroundColor Cyan 