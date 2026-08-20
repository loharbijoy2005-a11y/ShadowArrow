#!/usr/bin/env bash
set -e

branch_name="${1:-test-feature-branch}"
test_cmd="${2:-npm test}"

if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Working tree has uncommitted changes. Commit or stash them first." >&2
  exit 1
fi

target_branch=$(git rev-parse --abbrev-ref HEAD)

git checkout -b "$branch_name"

echo "Created and switched to feature branch: $branch_name"
echo "Paste AI code and press ENTER when ready to test..."
read -r

if [[ -n $(git status --porcelain) ]]; then
  git add .
  git commit -m "feat: apply AI code changes"
fi

if eval "$test_cmd"; then
  echo "Tests passed. Merging changes into $target_branch..."
  git checkout "$target_branch"
  git merge "$branch_name"
  git branch -d "$branch_name"
  echo "Successfully merged and removed $branch_name"
else
  echo "Tests failed! Remaining on $branch_name for manual inspection." >&2
  exit 1
fi
