#!/usr/bin/env bash
set -e

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Push the branch to origin (set upstream if needed)
git push -u origin "$CURRENT_BRANCH"

# Try to create a PR using the GitHub CLI if it's installed
if command -v gh > /dev/null; then
  gh pr create \
    --title "Automated PR: $CURRENT_BRANCH" \
    --body "Auto-generated PR by Antigravity AI." \
    --base main \
    --head "$CURRENT_BRANCH"
else
  echo "GitHub CLI (gh) not found. Please create a PR manually using the following URL:"
  echo "https://github.com/<owner>/<repo>/compare/main...$CURRENT_BRANCH?expand=1"
fi
