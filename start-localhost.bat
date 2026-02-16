@echo off
setlocal

rem
cd /d "%~dp0"

set PORT=8000

rem
where python >nul 2>&1
if %errorlevel% neq 0 (
  echo Python was not found on your system.
  echo Please install Python from https://www.python.org/ and try again.
  pause
  goto :eof
)

echo.
echo Starting local server on http://localhost:%PORT% ...
echo A browser window will open automatically in a moment.
echo.

rem start the server in a new window so this script can continue
start "" python -m http.server %PORT%

rem wait a bit to let the server start
timeout /t 2 /nobreak >nul

rem open default browser to the local site
start "" http://localhost:%PORT%/

endlocal
