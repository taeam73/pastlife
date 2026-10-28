param(
    [string]$ToolchainRoot = 'E:\AndroidToolchain',
    [string]$ShortBuildRoot = 'E:\p',
    [string]$CredentialsFile = 'E:\AndroidToolchain\signing\eas-credentials.json',
    [string]$KeystoreFile = 'E:\AndroidToolchain\signing\pastlife-eas-downloaded.jks'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$commit = (& git -C $repoRoot rev-parse --short=8 HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Could not read the Git commit.' }
$sourceChanges = & git -C $repoRoot status --porcelain -- apps/mobile packages
if ($sourceChanges) { throw 'Commit app and content changes before building. The short-path build uses the committed revision.' }
$resolvedBuildRoot = [System.IO.Path]::GetFullPath($ShortBuildRoot).TrimEnd('\')
if ($resolvedBuildRoot -ne 'E:\p') { throw 'ShortBuildRoot must be E:\p so Windows native paths stay short.' }
$sourceMarker = Join-Path $ShortBuildRoot '.pastlife-source-commit'
if (-not (Test-Path $sourceMarker) -or (Get-Content $sourceMarker -Raw).Trim() -ne $commit) {
    if (Test-Path $ShortBuildRoot) { Remove-Item -LiteralPath $ShortBuildRoot -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $ShortBuildRoot | Out-Null
    $archive = Join-Path $ToolchainRoot 'source.tar'
    & git -C $repoRoot archive --format=tar --output=$archive HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Could not archive the source revision.' }
    & tar -xf $archive -C $ShortBuildRoot
    if ($LASTEXITCODE -ne 0) { throw 'Could not extract the source revision.' }
    Remove-Item -LiteralPath $archive
    [System.IO.File]::WriteAllText($sourceMarker, $commit)
}
$mobileRoot = Join-Path $ShortBuildRoot 'apps\mobile'
$androidRoot = Join-Path $mobileRoot 'android'
$virtualStore = 'E:\v'
$workspaceConfig = Join-Path $ShortBuildRoot 'pnpm-workspace.yaml'
$workspaceSource = [System.IO.File]::ReadAllText($workspaceConfig)
if (-not $workspaceSource.Contains('virtualStoreDir:')) {
    [System.IO.File]::AppendAllText($workspaceConfig, "`r`nvirtualStoreDir: E:/v`r`nvirtualStoreDirMaxLength: 25`r`n")
}
$jdk = Get-ChildItem (Join-Path $ToolchainRoot 'jdk') -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } | Select-Object -First 1 -ExpandProperty FullName
$sdk = Join-Path $ToolchainRoot 'sdk'
$apksigner = Join-Path $sdk 'build-tools\36.0.0\apksigner.bat'
if (-not $jdk -or -not (Test-Path $apksigner)) { throw 'JDK 17 or Android SDK 36 is not installed.' }
if (-not (Test-Path $CredentialsFile) -or -not (Test-Path $KeystoreFile)) { throw 'EAS signing credentials are missing. Download them with eas credentials -p android.' }

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:GRADLE_USER_HOME = Join-Path $ToolchainRoot 'gradle'
$env:TEMP = Join-Path $ToolchainRoot 'tmp'
$env:TMP = $env:TEMP
$env:JAVA_TOOL_OPTIONS = "-Djava.io.tmpdir=$env:TEMP"
$env:Path = "$(Join-Path $jdk 'bin');$(Join-Path $sdk 'platform-tools');$env:Path"
$env:EAS_BUILD_PROFILE = 'preview'
$env:EXPO_PUBLIC_API_URL = 'https://pastlife-api-dev-36h6kgjkxq-du.a.run.app/api/v1'
$env:EXPO_PUBLIC_ASSET_BASE_URL = 'https://dev.pastlife-assets.pages.dev'
$env:EXPO_PUBLIC_ADMOB_TEST_ADS = 'true'
$env:EXPO_PUBLIC_ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713'
$env:EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712'
$env:EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917'

Push-Location $ShortBuildRoot
try {
    & corepack pnpm install --frozen-lockfile --store-dir (Join-Path $ToolchainRoot 'pnpm\store')
    if ($LASTEXITCODE -ne 0) { throw 'Workspace dependency installation failed.' }
} finally { Pop-Location }

# Windows Ninja can repeatedly regenerate the CMake manifest for these pnpm
# packages. Their inputs are fixed for this archived build, so configure once.
$nativeModules = @('react-native-screens', 'react-native-worklets')
foreach ($module in $nativeModules) {
    $moduleDir = Get-ChildItem $virtualStore -Directory |
        Where-Object { Test-Path (Join-Path $_.FullName "node_modules\$module\android\CMakeLists.txt") } |
        Select-Object -First 1
    if (-not $moduleDir) { throw "Missing native module: $module" }
    $cmakeFile = Join-Path $moduleDir.FullName "node_modules\$module\android\CMakeLists.txt"
    $cmakeSource = [System.IO.File]::ReadAllText($cmakeFile)
    if (-not $cmakeSource.Contains('CMAKE_SUPPRESS_REGENERATION')) {
        [System.IO.File]::WriteAllText($cmakeFile, "set(CMAKE_SUPPRESS_REGENERATION ON)`r`n" + $cmakeSource)
    }
}

Push-Location $mobileRoot
try {
    & corepack pnpm exec expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw 'Expo prebuild failed.' }
    Push-Location $androidRoot
    try {
        & .\gradlew.bat :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4 --no-daemon --console=plain
        if ($LASTEXITCODE -ne 0) { throw 'Android release build failed.' }
    } finally { Pop-Location }
} finally { Pop-Location }

$config = Get-Content $CredentialsFile -Raw -Encoding UTF8 | ConvertFrom-Json
$key = $config.android.keystore
$unsigned = Join-Path $androidRoot 'app\build\outputs\apk\release\app-release.apk'
$outDir = Join-Path $repoRoot 'output'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$app = Get-Content (Join-Path $mobileRoot 'app.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $app.expo.version
$versionCode = $app.expo.android.versionCode
$output = Join-Path $outDir "pastlife-local-preview-$version-build$versionCode.apk"
$storePasswordFile = Join-Path $env:TEMP ([guid]::NewGuid().ToString('N') + '.txt')
$keyPasswordFile = Join-Path $env:TEMP ([guid]::NewGuid().ToString('N') + '.txt')
try {
    [System.IO.File]::WriteAllText($storePasswordFile, [string]$key.keystorePassword)
    [System.IO.File]::WriteAllText($keyPasswordFile, [string]$key.keyPassword)
    & $apksigner sign --ks $KeystoreFile --ks-key-alias $key.keyAlias --ks-pass "file:$storePasswordFile" --key-pass "file:$keyPasswordFile" --out $output $unsigned
    if ($LASTEXITCODE -ne 0) { throw 'APK signing failed.' }
} finally {
    Remove-Item -LiteralPath $storePasswordFile,$keyPasswordFile -ErrorAction SilentlyContinue
}

& $apksigner verify --verbose --print-certs $output
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
Write-Output "APK: $output"
