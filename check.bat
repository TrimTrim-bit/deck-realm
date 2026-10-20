@echo off
title Checking Deck Realm Files...
echo.

if exist index.html       (echo [OK] index.html)       else (echo [MISSING] index.html)
if exist style.css        (echo [OK] style.css)        else (echo [MISSING] style.css)
if exist script.js        (echo [OK] script.js)        else (echo [MISSING] script.js)
if exist games.js         (echo [OK] games.js)         else (echo [MISSING] games.js)
if exist boardgames.js    (echo [OK] boardgames.js)    else (echo [MISSING] boardgames.js)
if exist wordlists.js     (echo [OK] wordlists.js)     else (echo [MISSING] wordlists.js)
if exist wordgames.js     (echo [OK] wordgames.js)     else (echo [MISSING] wordgames.js)
if exist moregames.js     (echo [OK] moregames.js)     else (echo [MISSING] moregames.js)
if exist moregames2.js    (echo [OK] moregames2.js)    else (echo [MISSING] moregames2.js)
if exist moregames3.js    (echo [OK] moregames3.js)    else (echo [MISSING] moregames3.js)
if exist moregames4.js    (echo [OK] moregames4.js)    else (echo [MISSING] moregames4.js)
if exist arcadegames.js   (echo [OK] arcadegames.js)   else (echo [MISSING] arcadegames.js)
if exist minesweeper.js   (echo [OK] minesweeper.js)   else (echo [MISSING] minesweeper.js)
if exist customization.js (echo [OK] customization.js) else (echo [MISSING] customization.js)
if exist pets.js          (echo [OK] pets.js)          else (echo [MISSING] pets.js)
if exist house.js         (echo [OK] house.js)         else (echo [MISSING] house.js)
if exist betting.js       (echo [OK] betting.js)       else (echo [MISSING] betting.js)
if exist casino.js        (echo [OK] casino.js)        else (echo [MISSING] casino.js)
if exist audio.js         (echo [OK] audio.js)         else (echo [MISSING] audio.js)
if exist tutorials.js     (echo [OK] tutorials.js)     else (echo [MISSING] tutorials.js)
if exist README.md        (echo [OK] README.md)        else (echo [MISSING] README.md)
if exist structure.md     (echo [OK] structure.md)     else (echo [MISSING] structure.md)

echo.
echo Check complete! Press any key to exit.
pause >nul