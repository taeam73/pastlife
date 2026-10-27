$ErrorActionPreference = 'Continue'
$scriptPath = Join-Path $PSScriptRoot 'deploy.ps1'

function Assert-Contains([string]$Output, [string]$Expected) {
  if (-not $Output.Contains($Expected)) { throw "Expected output to contain '$Expected'. Actual: $Output" }
}

$devOutput = (& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -Environment dev -DryRun -SkipChecks 2>&1 | Out-String)
Assert-Contains $devOutput 'HEAD:refs/heads/dev'
Assert-Contains $devOutput 'configure-dev-api.example'

$prodFailure = (& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -Environment prod -DryRun -SkipChecks 2>&1 | Out-String)
if ($LASTEXITCODE -eq 0) { throw 'Production dry-run unexpectedly succeeded without confirmation.' }
Assert-Contains $prodFailure 'Production deployment requires -ConfirmProduction.'

$prodOutput = (& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -Environment prod -DryRun -SkipChecks -ConfirmProduction 2>&1 | Out-String)
Assert-Contains $prodOutput 'HEAD:refs/heads/prod'
Assert-Contains $prodOutput 'configure-prod-api.example'

$temporaryRepository = Join-Path ([System.IO.Path]::GetTempPath()) ("pastlife-deploy-test-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temporaryRepository | Out-Null
try {
  Push-Location $temporaryRepository
  git init --quiet
  git config user.name test
  git config user.email test@example.com
  Set-Content tracked.txt 'clean'
  git add tracked.txt
  git commit --quiet -m initial
  Set-Content tracked.txt 'dirty'
  $dirtyFailure = (& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -Environment dev 2>&1 | Out-String)
  if ($LASTEXITCODE -eq 0) { throw 'Deployment unexpectedly accepted a dirty working tree.' }
  Assert-Contains $dirtyFailure 'The working tree must be clean before deployment.'
} finally {
  Pop-Location
  Remove-Item -LiteralPath $temporaryRepository -Recurse -Force
}

Write-Host 'Deployment script safety tests passed.'
