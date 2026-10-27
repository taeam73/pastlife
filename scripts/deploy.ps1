[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('dev', 'prod')]
  [string]$Environment,
  [switch]$DryRun,
  [switch]$ConfirmProduction,
  [switch]$SkipChecks
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Native([string]$Command, [string[]]$Arguments) {
  Write-Host "> $Command $($Arguments -join ' ')"
  if ($DryRun) { return }
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
}

function Wait-ForUrl([string]$Name, [string]$Url) {
  if ($DryRun) {
    Write-Host "[dry-run] verify $Name at $Url"
    return
  }
  for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
      if ($response.StatusCode -eq 200) {
        Write-Host "$Name is healthy: $Url"
        return
      }
    } catch {
      Write-Host "$Name is not ready ($attempt/60)."
    }
    Start-Sleep -Seconds 10
  }
  throw "$Name did not become healthy within 10 minutes: $Url"
}

if ($SkipChecks -and -not $DryRun) { throw '-SkipChecks is allowed only together with -DryRun.' }
if ($Environment -eq 'prod' -and -not $ConfirmProduction) {
  throw 'Production deployment requires -ConfirmProduction.'
}

$repositoryRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $repositoryRoot) { throw 'Run this command inside the Pastlife Git repository.' }
Push-Location $repositoryRoot
try {
  $dirty = & git status --porcelain
  if (-not $DryRun -and $dirty) { throw 'The working tree must be clean before deployment.' }

  if (-not $DryRun) {
    Invoke-Native git @('fetch', 'origin', '--prune')
    if ($Environment -eq 'prod') {
      & git rev-parse --verify origin/dev *> $null
      if ($LASTEXITCODE -ne 0) { throw 'origin/dev does not exist. Deploy dev first.' }
      & git merge-base --is-ancestor HEAD origin/dev
      if ($LASTEXITCODE -ne 0) { throw 'Production can deploy only a commit already promoted to origin/dev.' }
    }
  }

  if (-not $SkipChecks) {
    Invoke-Native corepack @('pnpm', 'typecheck')
    Invoke-Native corepack @('pnpm', 'test')
    Invoke-Native corepack @('pnpm', 'assets:test')
    Invoke-Native corepack @('pnpm', 'assets:build')
  }

  $prefix = "PASTLIFE_$($Environment.ToUpperInvariant())"
  $apiHealth = [Environment]::GetEnvironmentVariable("${prefix}_API_HEALTH_URL")
  $assetHealth = [Environment]::GetEnvironmentVariable("${prefix}_ASSET_HEALTH_URL")
  if (-not $apiHealth) { $apiHealth = [Environment]::GetEnvironmentVariable("${prefix}_API_HEALTH_URL", 'User') }
  if (-not $assetHealth) { $assetHealth = [Environment]::GetEnvironmentVariable("${prefix}_ASSET_HEALTH_URL", 'User') }
  if (-not $apiHealth) { $apiHealth = "https://configure-${Environment}-api.example/api/v1/health" }
  if (-not $assetHealth) { $assetHealth = "https://configure-${Environment}-assets.example/health.json" }
  if (-not $DryRun -and $assetHealth -match 'configure-') {
    throw "Set ${prefix}_ASSET_HEALTH_URL before deployment."
  }

  Invoke-Native git @('push', 'origin', "HEAD:refs/heads/$Environment")
  Invoke-Native powershell @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/deploy-cloud-run.ps1', '-Environment', $Environment)
  if (-not $DryRun -and $apiHealth -match 'configure-') {
    $gcloud = 'C:\Users\jyahn\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'
    $serviceUrl = (& $gcloud run services describe "pastlife-api-$Environment" --project=pastlife-gimmyoungsoft-2026 --region=asia-northeast3 --format='value(status.url)').Trim()
    if ($LASTEXITCODE -ne 0 -or -not $serviceUrl) { throw 'Unable to resolve the Cloud Run service URL.' }
    $apiHealth = "$serviceUrl/api/v1/health"
    [Environment]::SetEnvironmentVariable("${prefix}_API_HEALTH_URL", $apiHealth, 'User')
    Write-Host "Saved ${prefix}_API_HEALTH_URL for future deployments."
  }
  Wait-ForUrl 'Cloud Run API' $apiHealth
  Wait-ForUrl 'Cloudflare assets' $assetHealth
  Write-Host "Pastlife $Environment deployment completed for commit $(& git rev-parse --short HEAD)."
} finally {
  Pop-Location
}
