@echo off
setlocal enabledelayedexpansion

:: Get current branch name
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"

:: Prevent running on dev or main
if "%CURRENT_BRANCH%"=="dev" (
  echo Cannot create a PR from the 'dev' branch itself. Please switch to your feature branch.
  exit /b 1
)
if "%CURRENT_BRANCH%"=="main" (
  echo Cannot create a PR from the 'main' branch itself. Please switch to your feature branch.
  exit /b 1
)

:: Push the branch to origin (set upstream if needed)
git push -u origin "%CURRENT_BRANCH%"

:: Try to create a PR using the GitHub CLI targeting 'dev' without auto-merge
where gh >nul 2>&1
if %errorlevel%==0 (
  gh pr create ^
    --title "Feature: %CURRENT_BRANCH%" ^
    --body "Auto-generated PR by Antigravity AI targeting the 'dev' branch for testing." ^
    --base dev ^
    --head "%CURRENT_BRANCH%"
) else (
  echo GitHub CLI (gh) not found. Please create a PR manually using the following URL:
  echo https://github.com/<owner>/<repo>/compare/dev...%CURRENT_BRANCH%?expand=1
)

endlocal
