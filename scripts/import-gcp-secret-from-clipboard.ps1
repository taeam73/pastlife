param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('prod', 'dev')]
  [string]$Environment,

  [Parameter(Mandatory = $true)]
  [ValidateSet('pooled', 'direct')]
  [string]$ConnectionType
)

$ErrorActionPreference = 'Stop'
$project = 'pastlife-gimmyoungsoft-2026'
$gcloud = 'C:\Users\jyahn\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'

if (-not (Test-Path -LiteralPath $gcloud)) {
  throw 'Google Cloud SDK를 찾을 수 없습니다.'
}

$clipboardValue = (Get-Clipboard -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($clipboardValue)) {
  throw 'Clipboard is empty.'
}

# Neon may copy either the bare URL or a command such as:
# psql 'postgresql://user:password@host/database?sslmode=require'
$urlMatch = [regex]::Match($clipboardValue, 'postgres(?:ql)?://[^\s''"]+')
if (-not $urlMatch.Success) {
  throw 'Clipboard does not contain a Neon PostgreSQL connection URL.'
}
$value = $urlMatch.Value

$uri = [Uri]$value
if ($uri.Scheme -notin @('postgres', 'postgresql') -or $uri.Host -notlike '*.neon.tech') {
  throw 'The copied URL is not a Neon PostgreSQL connection URL.'
}
if ($uri.Query -notmatch '(^|[?&])sslmode=require(&|$)') {
  throw 'The copied URL does not include sslmode=require.'
}

$isPooled = $uri.Host -like '*-pooler.*'
if ($ConnectionType -eq 'pooled' -and -not $isPooled) {
  throw 'Pooled 연결 문자열이 아닙니다. Connection pooling을 켜고 다시 복사하세요.'
}
if ($ConnectionType -eq 'direct' -and $isPooled) {
  throw 'Direct 연결 문자열이 아닙니다. Connection pooling을 끄고 다시 복사하세요.'
}

$suffix = if ($ConnectionType -eq 'pooled') { 'database-url' } else { 'direct-url' }
$secretName = "pastlife-$Environment-$suffix"
$tempPath = Join-Path ([IO.Path]::GetTempPath()) ("pastlife-secret-$([Guid]::NewGuid().ToString('N')).txt")

try {
  $existing = & $gcloud secrets list --project=$project --filter="name:$secretName" --format='value(name)' --limit=1
  if (-not $existing) {
    & $gcloud secrets create $secretName --project=$project --replication-policy=automatic --quiet | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Secret 생성에 실패했습니다.' }
  }

  [IO.File]::WriteAllText($tempPath, $value, [Text.UTF8Encoding]::new($false))
  & $gcloud secrets versions add $secretName --project=$project --data-file=$tempPath --quiet | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Secret 버전 저장에 실패했습니다.' }

  Write-Host "Saved successfully: $secretName" -ForegroundColor Green
} finally {
  if (Test-Path -LiteralPath $tempPath) {
    Remove-Item -LiteralPath $tempPath -Force
  }
  # Windows PowerShell 5 rejects an empty string here, so overwrite with one space.
  Set-Clipboard -Value ' '
  Remove-Variable value -ErrorAction SilentlyContinue
  Remove-Variable clipboardValue -ErrorAction SilentlyContinue
}
