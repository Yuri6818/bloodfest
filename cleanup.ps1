# Remove JavaScript files that have TypeScript equivalents
Get-ChildItem -Path .\backend -Recurse -Include *.js | 
Where-Object { Test-Path ($_.FullName -replace '\.js$', '.ts') } | 
ForEach-Object {
    Write-Host "Removing $($_.FullName)"
    Remove-Item $_.FullName -Force
} 