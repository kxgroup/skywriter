# Uninstalls SkyWriter: removes shortcuts, the Add/Remove Programs entry,
# and the installed app folder. Works whether run from the project or from the
# installed copy (it deletes its own folder via a detached command).
$ErrorActionPreference = "SilentlyContinue"

$installDir = Join-Path $env:LOCALAPPDATA "Programs\SkyWriter"
$desktopLnk = Join-Path ([Environment]::GetFolderPath("Desktop")) "SkyWriter.lnk"
$startDir   = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$startLnk   = Join-Path $startDir "SkyWriter.lnk"
$regKey     = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\SkyWriter"

Write-Host "Uninstalling SkyWriter..."

# Stop the app if it is running
Get-Process SkyWriter -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove shortcuts
Remove-Item $desktopLnk -Force -ErrorAction SilentlyContinue
Remove-Item $startLnk   -Force -ErrorAction SilentlyContinue
Write-Host "  removed shortcuts"

# Remove Add/Remove Programs registry entry
Remove-Item $regKey -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  removed Add/Remove Programs entry"

# Remove the install folder. If this script lives inside it, schedule a detached
# delete so we are not holding the folder open.
if (Test-Path $installDir) {
    $self = $MyInvocation.MyCommand.Path
    if ($self -and $self.StartsWith($installDir, [System.StringComparison]::OrdinalIgnoreCase)) {
        Start-Process cmd.exe -ArgumentList "/c timeout /t 2 >nul & rmdir /s /q `"$installDir`"" -WindowStyle Hidden
        Write-Host "  scheduled removal of $installDir"
    } else {
        Remove-Item $installDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  removed $installDir"
    }
}

Write-Host ""
Write-Host "SkyWriter has been uninstalled."
