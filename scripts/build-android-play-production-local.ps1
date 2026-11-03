param(
    [string]$ShortBuildRoot = 'E:\p',
    [string]$ToolchainRoot = 'E:\AndroidToolchain',
    [string]$CredentialsFile = 'E:\AndroidToolchain\signing\eas-credentials.json',
    [string]$KeystoreFile = 'E:\AndroidToolchain\signing\pastlife-eas-downloaded.jks'
)

$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'build-android-play-internal-local.ps1'
& $script `
    -ShortBuildRoot $ShortBuildRoot `
    -ToolchainRoot $ToolchainRoot `
    -CredentialsFile $CredentialsFile `
    -KeystoreFile $KeystoreFile `
    -BuildTarget production
if ($LASTEXITCODE -ne 0) { throw 'Production Play App Bundle build failed.' }
