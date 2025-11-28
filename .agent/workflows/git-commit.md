---
description: Review and commit AI changes
---

# Git Workflow for AI Changes

This workflow helps you review and commit changes made by AI assistants.

## Quick Commit with Review

When AI makes changes, use this workflow to stage, review, and commit:

### 1. Check what changed
```bash
git status
git diff
```

### 2. Stage all changes
```bash
git add .
```

### 3. Review staged changes
```bash
git diff --staged
```

### 4. If changes look good, commit
```bash
git commit -m "feat: your commit message here"
```

### 5. If changes need fixes, unstage specific files
```bash
git restore --staged <file>
```

## Automated Review Script

You can also use this PowerShell script to auto-stage and show a review:

```powershell
# Save as: review-changes.ps1

# Stage all changes
git add .

# Show what's staged
Write-Host "`n📝 Staged Changes:" -ForegroundColor Cyan
git diff --staged --stat

Write-Host "`n🔍 Detailed Diff:" -ForegroundColor Cyan
git diff --staged

# Ask for confirmation
Write-Host "`n" -NoNewline
$commit = Read-Host "Commit these changes? (y/n)"

if ($commit -eq 'y') {
    $message = Read-Host "Enter commit message"
    git commit -m $message
    Write-Host "✅ Changes committed!" -ForegroundColor Green
} else {
    git restore --staged .
    Write-Host "❌ Changes unstaged" -ForegroundColor Yellow
}
```

## Usage

// turbo
Run the review script:
```bash
powershell -ExecutionPolicy Bypass -File review-changes.ps1
```

## Conventional Commit Messages

Use these prefixes for clear commit history:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples:
```bash
git commit -m "feat: add character jump mechanic"
git commit -m "fix: resolve GLTF import error"
git commit -m "docs: update AI guide with new patterns"
git commit -m "refactor: separate docs into dedicated folder"
```

## Git Aliases (Optional)

Add these to your `.gitconfig` for faster workflow:

```bash
git config --global alias.review 'diff --staged'
git config --global alias.unstage 'restore --staged'
git config --global alias.stage-all 'add .'
```

Then use:
- `git stage-all` - Stage all changes
- `git review` - Review staged changes
- `git unstage <file>` - Unstage specific file
