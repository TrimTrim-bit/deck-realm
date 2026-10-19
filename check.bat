@echo off
title Checking Deck Realm Integrity...
echo Verifying platform files...
echo.

if exist index.html   (echo [OK] index.html)   else (echo [MISSING] index.html)
if exist style.css    (echo [OK] style.css)    else (echo [MISSING] style.css)
if exist script.js    (echo [OK] script.js)    else (echo [MISSING] script.js)
if exist games.js     (echo [OK] games.js)     else (echo [MISSING] games.js)
if exist boardgames.js (echo [OK] boardgames.js) else (echo [MISSING] boardgames.js)
if exist casino.js    (echo [OK] casino.js)    else (echo [MISSING] casino.js)
if exist betting.js   (echo [OK] betting.js)   else (echo [MISSING] betting.js)
if exist tutorials.js (echo [OK] tutorials.js) else (echo [MISSING] tutorials.js)
if exist audio.js     (echo [OK] audio.js)     else (echo [MISSING] audio.js)
if exist README.md    (echo [OK] README.md)    else (echo [MISSING] README.md)
if exist structure.md (echo [OK] structure.md) else (echo [MISSING] structure.md)
if exist start.bat    (echo [OK] start.bat)    else (echo [MISSING] start.bat)
if exist check.bat    (echo [OK] check.bat)    else (echo [MISSING] check.bat)

echo.
echo Check complete! Press any key to exit.
pause >nul