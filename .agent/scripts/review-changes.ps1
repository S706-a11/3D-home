# Auto-stage and review git changes
# Usage: powershell -ExecutionPolicy Bypass -File .agent/scripts/review-changes.ps1

Write-Host "AI Changes Review Tool" -ForegroundColor Magenta
Write-Host "=" * 50

# Stage all changes
Write-Host "`n Staging all changes..." -ForegroundColor Cyan
git add .

# Show status
Write-Host "`n Status:" -ForegroundColor Cyan
git status --short

# Show summary of changes
Write-Host "`n Changes Summary:" -ForegroundColor Cyan
git diff --staged --stat

# Show detailed diff
Write-Host "`n Detailed Changes:" -ForegroundColor Cyan
Write-Host "(Press 'q' to exit diff view)" -ForegroundColor Yellow
git diff --staged --color

# Ask for confirmation
Write-Host "`n" -NoNewline
$continue = Read-Host "Do you want to commit these changes? (y/n)"

if ($continue -eq 'y' -or $continue -eq 'Y') {
    Write-Host "`n Commit Message Tips:" -ForegroundColor Yellow
    Write-Host "  feat: New feature" -ForegroundColor Gray
    Write-Host "  fix: Bug fix" -ForegroundColor Gray
    Write-Host "  docs: Documentation" -ForegroundColor Gray
    Write-Host "  refactor: Code restructuring" -ForegroundColor Gray
    Write-Host "  style: Formatting" -ForegroundColor Gray
    
    $message = Read-Host "`nEnter commit message"
    
    if ($message) {
        git commit -m $message
        Write-Host "`n Changes committed successfully!" -ForegroundColor Green
        Write-Host "`n Recent commits:" -ForegroundColor Cyan
        git log --oneline -5
    } else {
        Write-Host "`n No commit message provided. Changes remain staged." -ForegroundColor Red
    }
} else {
    git restore --staged .
    Write-Host "`n Changes unstaged. Working directory unchanged." -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
Read-Host "Press Enter to exit"
