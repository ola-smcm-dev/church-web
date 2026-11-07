# ============================================================
# Auto-push watcher: Church Website folder -> GitHub "dev" branch
#
# EDIT the three values below to match your setup, save, then
# follow the setup instructions to run this permanently.
# ============================================================

$global:source  = "C:\Users\biju1\OneDrive\Documents\Church\OLA\ChurchWebsite"
$global:gitRepo = "C:\git\gitolasyromalabarct-website"
$global:branch  = "dev"
$global:logFile = Join-Path $global:gitRepo "auto-push.log"

function global:Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $global:logFile -Value "$ts  $msg"
}

function global:Sync-And-Push {
    try {
        # Mirror the OneDrive folder into the git folder, excluding .git itself,
        # the Claude outputs subfolder (never part of the deployed site), and
        # this script's own log file.
        robocopy $global:source $global:gitRepo /MIR /XD ".git" "Claude outputs" /XF "auto-push.log" /NFL /NDL /NJH /NJS /R:1 /W:1 | Out-Null

        Push-Location $global:gitRepo
        git add -A | Out-Null
        $changes = git status --porcelain
        if ($changes) {
            $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto-sync from ChurchWebsite folder - $ts" | Out-Null
            git pull --rebase origin $global:branch 2>&1 | Out-Null
            $pushResult = git push origin $global:branch 2>&1
            Write-Log "Pushed changes. $pushResult"
        }
        Pop-Location
    } catch {
        Write-Log "ERROR: $($_.Exception.Message)"
        try { Pop-Location -ErrorAction SilentlyContinue } catch {}
    }
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $global:source
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, DirectoryName'

# Debounce: wait until 8 seconds of quiet after the last change before
# syncing, so a batch of saves becomes one commit instead of many.
$global:debounceTimer = New-Object System.Timers.Timer
$global:debounceTimer.Interval = 8000
$global:debounceTimer.AutoReset = $false
Register-ObjectEvent -InputObject $global:debounceTimer -EventName Elapsed -Action { Sync-And-Push } | Out-Null

$onEvent = {
    $global:debounceTimer.Stop()
    $global:debounceTimer.Start()
}
Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onEvent | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onEvent | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $onEvent | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onEvent | Out-Null

Write-Log "Watcher started - monitoring $global:source"
while ($true) { Start-Sleep -Seconds 3600 }
