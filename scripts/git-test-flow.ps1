param (
    [string]$BranchName = "test-feature-branch",
    [string]$TestCommand = "npm test"
)

$ErrorActionPreference = "Stop"

if (git status --porcelain) {
    Write-Error "Working tree has uncommitted changes. Commit or stash them first."
    exit 1
}

$targetBranch = (git rev-parse --abbrev-ref HEAD).Trim()

git checkout -b $BranchName

Write-Host "Created and switched to feature branch: $BranchName"
Read-Host "Paste AI code and press ENTER when ready to test"

if (git status --porcelain) {
    git add .
    git commit -m "feat: apply AI code changes"
}

try {
    Invoke-Expression $TestCommand
    Write-Host "Tests passed. Merging changes into $targetBranch..."
    git checkout $targetBranch
    git merge $BranchName
    git branch -d $BranchName
    Write-Host "Successfully merged and removed $BranchName"
} catch {
    Write-Error "Tests failed! Remaining on $BranchName for manual inspection."
    exit 1
}
