@echo off
cd /d C:\Users\amich\Dev\Test\Reversi
echo Launching Cloudflare Tunnel...
echo Copy the URL and update vercel.json
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run --url http://localhost:5210
pause
