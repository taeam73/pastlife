[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('dev', 'prod')]
  [string]$Environment,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$project = 'pastlife-gimmyoungsoft-2026'
$region = 'asia-northeast3'
$repository = 'pastlife'
$service = "pastlife-api-$Environment"
$migrationJob = "pastlife-migrate-$Environment"
$databaseSecret = "pastlife-$Environment-database-url"
$directSecret = "pastlife-$Environment-direct-url"
$jwtSecret = "pastlife-$Environment-jwt-secret"
$adminSecret = "pastlife-$Environment-admin-token"
$runtimeServiceAccountName = 'pastlife-api-runtime'
$runtimeServiceAccount = "$runtimeServiceAccountName@$project.iam.gserviceaccount.com"
$cloudBuildServiceAccount = '31514748957-compute@developer.gserviceaccount.com'
$gcloud = 'C:\Users\jyahn\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'

if (-not (Test-Path -LiteralPath $gcloud)) {
  $resolved = Get-Command gcloud -ErrorAction SilentlyContinue
  if (-not $resolved) { throw 'Google Cloud SDK is required.' }
  $gcloud = $resolved.Source
}

function Invoke-Gcloud([string[]]$Arguments, [switch]$Capture) {
  Write-Host "> gcloud $($Arguments -join ' ')"
  if ($DryRun) {
    if ($Capture) { return "https://dry-run-$Environment.example" }
    return
  }
  if ($Capture) {
    $result = & $gcloud @Arguments
    if ($LASTEXITCODE -ne 0) { throw "gcloud failed with exit code $LASTEXITCODE" }
    return ($result | Out-String).Trim()
  }
  & $gcloud @Arguments
  if ($LASTEXITCODE -ne 0) { throw "gcloud failed with exit code $LASTEXITCODE" }
}

function Test-Secret([string]$Name) {
  if ($DryRun) { return $true }
  $names = @(& $gcloud secrets list "--project=$project" --format='value(name)')
  return $names -contains $Name
}

function Ensure-RandomSecret([string]$Name) {
  if (Test-Secret $Name) { return }
  if ($DryRun) {
    Write-Host "[dry-run] create random secret $Name"
    return
  }
  $bytes = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $value = [Convert]::ToBase64String($bytes)
  $tempPath = Join-Path ([IO.Path]::GetTempPath()) ("pastlife-random-$([Guid]::NewGuid().ToString('N')).txt")
  try {
    [IO.File]::WriteAllText($tempPath, $value, [Text.UTF8Encoding]::new($false))
    Invoke-Gcloud @('secrets', 'create', $Name, "--project=$project", '--replication-policy=automatic', '--quiet')
    Invoke-Gcloud @('secrets', 'versions', 'add', $Name, "--project=$project", "--data-file=$tempPath", '--quiet')
  } finally {
    if (Test-Path -LiteralPath $tempPath) { Remove-Item -LiteralPath $tempPath -Force }
    Remove-Variable value -ErrorAction SilentlyContinue
  }
}

foreach ($required in @($databaseSecret, $directSecret)) {
  if (-not (Test-Secret $required)) { throw "Required Secret Manager secret is missing: $required" }
}
Ensure-RandomSecret $jwtSecret
Ensure-RandomSecret $adminSecret

if ($DryRun) {
  Write-Host "[dry-run] ensure runtime service account $runtimeServiceAccount"
} else {
  $serviceAccounts = @(& $gcloud iam service-accounts list "--project=$project" --format='value(email)')
  if ($serviceAccounts -notcontains $runtimeServiceAccount) {
    Invoke-Gcloud @('iam', 'service-accounts', 'create', $runtimeServiceAccountName, "--project=$project", '--display-name=Pastlife API runtime', '--quiet')
  }
  Invoke-Gcloud @(
    'projects', 'add-iam-policy-binding', $project,
    "--member=serviceAccount:$runtimeServiceAccount",
    '--role=roles/secretmanager.secretAccessor',
    '--condition=None', '--quiet'
  )
  Invoke-Gcloud @(
    'projects', 'add-iam-policy-binding', $project,
    "--member=serviceAccount:$cloudBuildServiceAccount",
    '--role=roles/cloudbuild.builds.builder',
    '--condition=None', '--quiet'
  )
}

$sha = (& git rev-parse --short=12 HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Unable to resolve the Git commit.' }
$image = "$region-docker.pkg.dev/$project/$repository/api-$Environment`:$sha"

if (-not $DryRun) {
  $artifactRepository = & $gcloud artifacts repositories list "--project=$project" "--location=$region" "--filter=name~/$repository$" --format='value(name)' --limit=1
  if (-not $artifactRepository) {
    Invoke-Gcloud @('artifacts', 'repositories', 'create', $repository, "--project=$project", "--location=$region", '--repository-format=docker', '--description=Pastlife containers', '--quiet')
  }
} else {
  Write-Host "[dry-run] ensure Artifact Registry repository $repository"
}

Invoke-Gcloud @('builds', 'submit', '.', "--project=$project", "--region=$region", "--tag=$image", '--quiet')

$secretBindings = "DATABASE_URL=$databaseSecret`:latest,DIRECT_URL=$directSecret`:latest,JWT_SECRET=$jwtSecret`:latest,ADMIN_TOKEN=$adminSecret`:latest"
$baseEnvironment = if ($Environment -eq 'dev') {
  'NODE_ENV=development,USE_IN_MEMORY_DB=false,USE_MOCK_GOOGLE=true,CONTENT_VERSION=3.0.0'
} else {
  $googleClientIds = [Environment]::GetEnvironmentVariable('PASTLIFE_PROD_GOOGLE_CLIENT_IDS')
  $rewardedUnitId = [Environment]::GetEnvironmentVariable('PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID')
  if (-not $googleClientIds) { $googleClientIds = [Environment]::GetEnvironmentVariable('PASTLIFE_PROD_GOOGLE_CLIENT_IDS', 'User') }
  if (-not $rewardedUnitId) { $rewardedUnitId = [Environment]::GetEnvironmentVariable('PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID', 'User') }
  if (-not $googleClientIds) { throw 'Set PASTLIFE_PROD_GOOGLE_CLIENT_IDS before production deployment.' }
  if ($rewardedUnitId -notmatch '^ca-app-pub-\d{16}/\d+$') { throw 'Set a valid PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID before production deployment.' }
  "NODE_ENV=production,USE_IN_MEMORY_DB=false,USE_MOCK_GOOGLE=false,CONTENT_VERSION=3.0.0,GOOGLE_CLIENT_IDS=$googleClientIds,ADMOB_REWARDED_UNIT_ID=$rewardedUnitId"
}

Invoke-Gcloud @(
  'run', 'jobs', 'deploy', $migrationJob,
  "--project=$project", "--region=$region", "--image=$image",
  '--command=corepack', '--args=pnpm,db:migrate:deploy',
  "--set-secrets=$secretBindings", "--set-env-vars=$baseEnvironment",
  "--service-account=$runtimeServiceAccount", '--max-retries=0', '--task-timeout=10m', '--quiet'
)
Invoke-Gcloud @('run', 'jobs', 'execute', $migrationJob, "--project=$project", "--region=$region", '--wait', '--quiet')

Invoke-Gcloud @(
  'run', 'deploy', $service,
  "--project=$project", "--region=$region", "--image=$image", '--platform=managed',
  '--allow-unauthenticated', '--port=8080', '--cpu=1', '--memory=1Gi',
  '--min-instances=0', '--max-instances=3', '--concurrency=40',
  "--service-account=$runtimeServiceAccount",
  "--set-secrets=$secretBindings", "--set-env-vars=$baseEnvironment",
  '--quiet'
)

$serviceUrl = Invoke-Gcloud @('run', 'services', 'describe', $service, "--project=$project", "--region=$region", '--format=value(status.url)') -Capture
Write-Host "CLOUD_RUN_SERVICE_URL=$serviceUrl"
Write-Host "CLOUD_RUN_HEALTH_URL=$serviceUrl/api/v1/health"

