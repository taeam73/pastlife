$ErrorActionPreference = 'Stop'
$postgresBin = 'C:\Program Files\PostgreSQL\17\bin'
$dataDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) '.local-postgres'
$control = Join-Path $postgresBin 'pg_ctl.exe'
$ready = Join-Path $postgresBin 'pg_isready.exe'

if (-not (Test-Path -LiteralPath $control)) {
  throw 'PostgreSQL 17 is not installed at the expected location.'
}
if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION'))) {
  throw 'The local development cluster is missing. Do not initialize a new cluster over existing data.'
}

& $ready -h 127.0.0.1 -p 5433 *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Output 'Local PostgreSQL is already running.'
  exit 0
}

& $control -D $dataDirectory -o '-h 127.0.0.1 -p 5433' -l (Join-Path $dataDirectory 'server.log') start
if ($LASTEXITCODE -ne 0) { throw 'Failed to start local PostgreSQL.' }
