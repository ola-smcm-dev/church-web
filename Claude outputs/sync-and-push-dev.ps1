# ============================================================
# Polling sync: Church Website folder -> GitHub "dev" branch
#
# Run once per invocation (no watcher, no infinite loop). Meant to be
# fired every few minutes by Windows Task Scheduler. Paths below are
# already set to match this setup - double check before running.
# ============================================================

$source  = "C:\Users\biju1\OneDrive\Documents\Church\OLA\ChurchWebsite"
$gitRepo = "C:\git\gitolasyromalabarct-website"
$branch  = "dev"
$logFile = Join-Path $gitRepo "auto-push.log"

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "$ts  $msg"
}

try {
    # Mirror the OneDrive folder into the git folder, excluding .git itself,
    # the Claude outputs subfolder (never part of the deployed site), and
    # this script's own log file.
    robocopy $source $gitRepo /MIR /XD ".git" "Claude outputs" /XF "auto-push.log" /NFL /NDL /NJH /NJS /R:1 /W:1 | Out-Null

    Push-Location $gitRepo
    git add -A | Out-Null
    $changes = git status --porcelain

    if ($changes) {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-sync from ChurchWebsite folder - $ts" | Out-Null
        git pull --rebase origin $branch 2>&1 | Out-Null
        $pushResult = git push origin $branch 2>&1
        Write-Log "Pushed changes. $pushResult"
    } else {
        Write-Log "Checked - no changes."
    }

    Pop-Location
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    try { Pop-Location -ErrorAction SilentlyContinue } catch {}
}
