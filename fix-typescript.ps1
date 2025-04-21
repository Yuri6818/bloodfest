# Advanced script to fix ESM module issues in TypeScript

Write-Host "Starting comprehensive TypeScript ESM fixes..." -ForegroundColor Cyan

# 1. Find and process all TypeScript files
Write-Host "Finding TypeScript files..." -ForegroundColor Yellow
$tsFiles = Get-ChildItem -Path .\backend -Recurse -Include *.ts

foreach ($file in $tsFiles) {
    Write-Host "Processing $($file.Name)" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Add .js extension to local imports
    $newContent = $content -replace "from ['\"](\.\.?\/[^'\"]+)['\"]\s*;?", "from '$1.js';"
    
    # Remove .js extensions if they're duplicated
    $newContent = $newContent -replace "from ['\"](\.\.?\/[^'\"]+)\.js\.js['\"]\s*;?", "from '$1.js';"
    
    # Fix import statements with 'import * as' syntax
    $newContent = $newContent -replace "import \* as ([^ ]+) from ['\"](\.\.?\/[^'\"]+)['\"]\s*;?", "import * as `$1 from '`$2.js';"
    
    # Don't add extensions to node_modules imports
    $newContent = $newContent -replace "from ['\"]((?!\.\.?\/)[^'\"\.]+)\.js['\"]\s*;?", "from '$1';"
    
    # Save changes if the content was modified
    if ($content -ne $newContent) {
        Write-Host "  Fixed imports in $($file.Name)" -ForegroundColor Green
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
    }
}

# 2. Update package.json to properly support ESM
$packageJsonPath = ".\backend\package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "Updating backend package.json for ESM..." -ForegroundColor Yellow
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    # Add type: module
    $packageJson | Add-Member -NotePropertyName "type" -NotePropertyValue "module" -Force
    
    # Update scripts for ESM
    $packageJson.scripts.dev = "node --loader ts-node/esm --experimental-specifier-resolution=node --no-warnings server.ts"
    
    # Save updated package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    Write-Host "Updated package.json" -ForegroundColor Green
}

# 3. Update tsconfig.json for ESM
$tsconfigPath = ".\backend\tsconfig.json"
if (Test-Path $tsconfigPath) {
    Write-Host "Updating tsconfig.json for ESM..." -ForegroundColor Yellow
    $tsconfig = Get-Content -Path $tsconfigPath -Raw | ConvertFrom-Json
    
    # Update compiler options for ESM
    $tsconfig.compilerOptions.module = "NodeNext"
    $tsconfig.compilerOptions.moduleResolution = "NodeNext"
    $tsconfig.compilerOptions.target = "ES2022"
    $tsconfig.compilerOptions.esModuleInterop = $true
    $tsconfig.compilerOptions.allowSyntheticDefaultImports = $true
    
    # Save updated tsconfig.json
    $tsconfig | ConvertTo-Json -Depth 10 | Set-Content -Path $tsconfigPath
    Write-Host "Updated tsconfig.json" -ForegroundColor Green
}

# Create a proper nodemon configuration for ESM support
$nodemonPath = ".\backend\nodemon.json"
$nodemonConfig = @{
    "watch": @("src")
    "ext": "ts,js,json"
    "ignore": @("src/**/*.spec.ts")
    "exec": "node --loader ts-node/esm --experimental-specifier-resolution=node server.ts"
}
$nodemonConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $nodemonPath
Write-Host "Created nodemon.json for ESM support" -ForegroundColor Green

Write-Host "TypeScript ESM fixes completed!" -ForegroundColor Cyan 