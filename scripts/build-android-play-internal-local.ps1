param(
    [string]$ShortBuildRoot = 'E:\p',
    [string]$ToolchainRoot = 'E:\AndroidToolchain',
    [string]$CredentialsFile = 'E:\AndroidToolchain\signing\eas-credentials.json',
    [string]$KeystoreFile = 'E:\AndroidToolchain\signing\pastlife-eas-downloaded.jks'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedBuildRoot = [System.IO.Path]::GetFullPath($ShortBuildRoot).TrimEnd('\')
if ($resolvedBuildRoot -ne 'E:\p') { throw 'ShortBuildRoot must be E:\p.' }
$sourceMarker = Join-Path $ShortBuildRoot '.pastlife-source-commit'
if (-not (Test-Path $sourceMarker)) { throw 'Build the matching APK with build-android-local.ps1 first.' }
$mobileRoot = Join-Path $ShortBuildRoot 'apps\mobile'
$androidRoot = Join-Path $mobileRoot 'android'
$gradleFile = Join-Path $androidRoot 'app\build.gradle'
if (-not (Test-Path $gradleFile)) { throw 'Native Android project is missing. Build the APK first.' }
if (-not (Test-Path $CredentialsFile) -or -not (Test-Path $KeystoreFile)) { throw 'EAS signing credentials are missing.' }

$jdk = Get-ChildItem (Join-Path $ToolchainRoot 'jdk') -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
    Select-Object -First 1 -ExpandProperty FullName
if (-not $jdk) { throw 'JDK 17 is missing.' }
$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = Join-Path $ToolchainRoot 'sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USER_HOME = Join-Path $ToolchainRoot 'gradle'
$env:TEMP = Join-Path $ToolchainRoot 'tmp'
$env:TMP = $env:TEMP
$env:JAVA_TOOL_OPTIONS = "-Djava.io.tmpdir=$env:TEMP"
$env:Path = "$(Join-Path $jdk 'bin');$env:Path"
$env:EAS_BUILD_PROFILE = 'play-internal'
$env:EXPO_PUBLIC_API_URL = 'https://pastlife-api-dev-36h6kgjkxq-du.a.run.app/api/v1'
$env:EXPO_PUBLIC_ASSET_BASE_URL = 'https://dev.pastlife-assets.pages.dev'
$env:EXPO_PUBLIC_ADMOB_TEST_ADS = 'true'
$env:EXPO_PUBLIC_ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713'
$env:EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712'
$env:EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917'

$config = Get-Content $CredentialsFile -Raw | ConvertFrom-Json
$key = $config.android.keystore
$env:PASTLIFE_UPLOAD_STORE_FILE = $KeystoreFile
$env:PASTLIFE_UPLOAD_STORE_PASSWORD = [string]$key.keystorePassword
$env:PASTLIFE_UPLOAD_KEY_ALIAS = [string]$key.keyAlias
$env:PASTLIFE_UPLOAD_KEY_PASSWORD = [string]$key.keyPassword

# The generated release variant defaults to the debug certificate. Replace its
# signing configuration only in this disposable E:\p checkout.
$source = [System.IO.File]::ReadAllText($gradleFile)
if (-not $source.Contains('storeFile file(System.getenv("PASTLIFE_UPLOAD_STORE_FILE"))')) {
    $needle = '    signingConfigs {'
    if (-not $source.Contains($needle)) { throw 'Could not locate Android signingConfigs.' }
    $releaseConfig = @'
    signingConfigs {
        playUpload {
            storeFile file(System.getenv("PASTLIFE_UPLOAD_STORE_FILE"))
            storePassword System.getenv("PASTLIFE_UPLOAD_STORE_PASSWORD")
            keyAlias System.getenv("PASTLIFE_UPLOAD_KEY_ALIAS")
            keyPassword System.getenv("PASTLIFE_UPLOAD_KEY_PASSWORD")
        }
'@
    $source = $source.Replace($needle, $releaseConfig)
    $debugSigning = 'signingConfig signingConfigs.debug'
    $last = $source.LastIndexOf($debugSigning)
    if ($last -lt 0) { throw 'Could not locate Android release signing.' }
    $source = $source.Remove($last, $debugSigning.Length).Insert($last, 'signingConfig signingConfigs.playUpload')
    [System.IO.File]::WriteAllText($gradleFile, $source)
}

try {
    Push-Location $androidRoot
    try {
        & .\gradlew.bat :app:bundleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4 --no-daemon --console=plain
        if ($LASTEXITCODE -ne 0) { throw 'Android App Bundle build failed.' }
    } finally { Pop-Location }

    $sourceBundle = Join-Path $androidRoot 'app\build\outputs\bundle\release\app-release.aab'
    if (-not (Test-Path $sourceBundle)) { throw 'Signed Android App Bundle was not produced.' }
    $app = Get-Content (Join-Path $mobileRoot 'app.json') -Raw | ConvertFrom-Json
    $outDir = Join-Path $repoRoot 'output'
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
    $output = Join-Path $outDir "pastlife-play-internal-$($app.expo.version)-build$($app.expo.android.versionCode).aab"
    Copy-Item -LiteralPath $sourceBundle -Destination $output -Force
    & (Join-Path $jdk 'bin\jarsigner.exe') -verify $output
    if ($LASTEXITCODE -ne 0) { throw 'App Bundle signature verification failed.' }
    Write-Output "AAB: $output"
    Write-Output 'Track: Play Console internal testing only (development API and Google test ads).'
} finally {
    Remove-Item Env:PASTLIFE_UPLOAD_STORE_FILE,Env:PASTLIFE_UPLOAD_STORE_PASSWORD,Env:PASTLIFE_UPLOAD_KEY_ALIAS,Env:PASTLIFE_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
}
