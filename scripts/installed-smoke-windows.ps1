# Real silent NSIS install and two desktop launches, not signature/updater acceptance.
param([Parameter(Mandatory = $true)][string]$BundleDir)
$ErrorActionPreference = 'Stop'
if (-not $env:RUNNER_TEMP -or -not $env:GITHUB_SHA) { throw 'Missing required runner environment' }
$evidence = Join-Path $env:RUNNER_TEMP 'cineharbor-installed-smoke'
New-Item -Path $evidence -ItemType Directory -Force | Out-Null
$installers = @(Get-ChildItem -LiteralPath $BundleDir -Recurse -File -Filter '*setup.exe')
if ($installers.Count -ne 1) { throw "Expected one NSIS installer; found $($installers.Count)" }
$installer = $installers[0]
$installerHash = (Get-FileHash -LiteralPath $installer.FullName -Algorithm SHA256).Hash
$installDir = Join-Path $env:RUNNER_TEMP ('CineHarborInstall-' + $PID)
New-Item -Path $installDir -ItemType Directory -Force | Out-Null
$application = $null
try {
    # NSIS /D= must be the last installer argument, and must not have quotes.
    if ($installDir.Contains(' ')) { throw 'NSIS /D target cannot contain spaces' }
    $process = Start-Process -FilePath $installer.FullName -ArgumentList @('/S', "/D=$installDir") -Wait -PassThru
    if ($process.ExitCode -ne 0) { throw "Installer failed with exit code $($process.ExitCode)" }
    $appFiles = @(Get-ChildItem -LiteralPath $installDir -File -Filter '*.exe' |
        Where-Object { $_.Name -notmatch '(?i)uninstall|unins|local-service' })
    if ($appFiles.Count -ne 1) { throw "Expected one installed app executable; found $($appFiles.Count) in $installDir" }
    $app = $appFiles[0]
    $sidecars = @(Get-ChildItem -LiteralPath $installDir -Recurse -File -Filter '*local-service*.exe')
    if ($sidecars.Count -lt 1) { throw 'Installed app is missing native sidecar' }
    $appHash = (Get-FileHash -LiteralPath $app.FullName -Algorithm SHA256).Hash
    $sidecarHash = (Get-FileHash -LiteralPath $sidecars[0].FullName -Algorithm SHA256).Hash
    for ($attempt = 1; $attempt -le 2; $attempt++) {
        $application = Start-Process -FilePath $app.FullName -WorkingDirectory $app.DirectoryName -PassThru
        Start-Sleep -Seconds 10
        $application.Refresh()
        if ($application.HasExited) { throw "Installed app launch #$attempt exited early with $($application.ExitCode)" }
        Write-Host "Installed app launch #$attempt remained alive for 10 seconds"
        $mode = if ($attempt -eq 1) { "seed" } else { "verify" }
        python scripts/installed-sidecar-persistence.py $mode --evidence $evidence
        if ($LASTEXITCODE -ne 0) { throw "Installed sidecar/SQLite $mode check failed" }
        Stop-Process -Id $application.Id -Force -ErrorAction Stop
        $application.WaitForExit()
        $application = $null
    }
    $report = [ordered]@{
        source_sha = $env:GITHUB_SHA; platform = 'windows-x64'; installer = 'nsis'
        installer_sha256 = $installerHash; installed_binary_sha256 = $appHash
        installed_sidecar_sha256 = $sidecarHash; native_install = $true
        startup = $true; restart = $true; signed_verification = $false; ui_interaction = $false
    }
    $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $evidence 'result.json') -Encoding UTF8
    $report | ConvertTo-Json | Write-Host
}
finally {
    if ($application -and -not $application.HasExited) { Stop-Process -Id $application.Id -Force -ErrorAction SilentlyContinue }
    # Ephemeral hosted runner: do not elevate or invoke a third-party uninstaller.
}
