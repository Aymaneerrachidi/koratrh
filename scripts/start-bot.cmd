@echo off
REM Keeps the KORAT Telegram bot running: restarts it if it ever exits.
REM Registered as a Scheduled Task that fires at logon.
title KORAT Telegram bot
cd /d "%~dp0.."

:loop
echo [%date% %time%] starting KORAT bot...
call npx tsx bot/index.ts
echo [%date% %time%] bot exited, restarting in 10s...
timeout /t 10 /nobreak >nul
goto loop
