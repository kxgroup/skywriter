# Installs the packaged SkyWriter app into %LOCALAPPDATA%\Programs\SkyWriter
# and creates Desktop + Start Menu shortcuts (with icon) pointing to it.
$ErrorActionPreference = "Stop"

$root    = Split-Path -Parent $PSScriptRoot
$source  = Join-Path $root "release\SkyWriter-win32-x64"
$icon    = Join-Path $root "build\icon.ico"

if (-not (Test-Path (Join-Path $source "SkyWriter.exe"))) {
    Write-Error "Packaged app not found. Run 'npm run package' first."
}

# Install destination (per-user, no admin required)
$installDir = Join-Path $env:LOCALAPPDATA "Programs\SkyWriter"

Write-Host "Installing to $installDir ..."

# Close any running instance so its files aren't locked.
Get-Process SkyWriter -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 800

if (Test-Path $installDir) {
    Remove-Item $installDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $installDir -Recurse -Force

$exe     = Join-Path $installDir "SkyWriter.exe"
$iconDst = Join-Path $installDir "icon.ico"
Copy-Item $icon $iconDst -Force

# Copy the uninstaller alongside the app so it works even if the project is deleted
$uninstSrc = Join-Path $PSScriptRoot "uninstall.ps1"
$uninstDst = Join-Path $installDir "uninstall.ps1"
Copy-Item $uninstSrc $uninstDst -Force

function New-Shortcut($lnkPath, $target, $args, $iconPath) {
    $shell = New-Object -ComObject WScript.Shell
    $lnk = $shell.CreateShortcut($lnkPath)
    $lnk.TargetPath       = $target
    if ($args) { $lnk.Arguments = $args }
    $lnk.WorkingDirectory = $installDir
    $lnk.IconLocation     = $iconPath
    $lnk.Description       = "SkyWriter by KXGroup"
    $lnk.Save()
    Write-Host "  shortcut: $lnkPath"
}

# Desktop + Start Menu app shortcuts
$desktop   = [Environment]::GetFolderPath("Desktop")
$startMenu  = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
New-Shortcut (Join-Path $desktop "SkyWriter.lnk")  $exe $null $iconDst
New-Shortcut (Join-Path $startMenu "SkyWriter.lnk") $exe $null $iconDst

# Register in Windows "Apps & features" / Add-Remove Programs (per-user, no admin)
$regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\SkyWriter"
$uninstCmd = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$uninstDst`""
$sizeKb = [int]((Get-ChildItem $installDir -Recurse | Measure-Object Length -Sum).Sum / 1024)

New-Item -Path $regKey -Force | Out-Null
Set-ItemProperty $regKey DisplayName     "SkyWriter"
Set-ItemProperty $regKey DisplayVersion  "1.0.0"
Set-ItemProperty $regKey Publisher       "KXGroup"
Set-ItemProperty $regKey DisplayIcon     $iconDst
Set-ItemProperty $regKey InstallLocation $installDir
Set-ItemProperty $regKey UninstallString $uninstCmd
Set-ItemProperty $regKey NoModify        1 -Type DWord
Set-ItemProperty $regKey NoRepair        1 -Type DWord
Set-ItemProperty $regKey EstimatedSize   $sizeKb -Type DWord
Write-Host "  registered in Apps & features"

Write-Host ""
Write-Host "Done. SkyWriter is installed at $installDir"
Write-Host "Uninstall via Settings > Apps, or run scripts\uninstall.ps1"
