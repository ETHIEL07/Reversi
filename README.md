# Reversi — React + .NET Game

A Reversi (Othello) game with React frontend and .NET backend.

## Status

- ✅ Frontend: Live on https://reversi-psi-two.vercel.app
- ✅ Backend: Local with Cloudflare Tunnel
- ✅ Database: SQLite (local)

## Running Locally & Online

**Double-click to start everything:**
```
START_REVERSI.cmd
```

This script:
1. Starts the .NET API on `http://localhost:5210`
2. Launches Cloudflare Tunnel (shows tunnel URL in terminal)
3. Displays setup instructions

## After Starting Tunnel

Once the tunnel is running:
1. **Copy the tunnel URL** from the Cloudflare window (e.g., `https://xxx-xxx-xxx.trycloudflare.com`)
2. Update `Front/vercel.json`:
   ```json
   "destination": "https://xxx-xxx-xxx.trycloudflare.com/api/:path*"
   ```
3. **Commit & push:**
   ```bash
   git add Front/vercel.json
   git commit -m "Update tunnel URL"
   git push origin main
   ```
4. **Refresh the frontend** at https://reversi-psi-two.vercel.app
5. Click "Jouer" → "Nouvelle partie" → Play! 🎮

## Architecture

```
┌──────────────────────────────────────┐
│ Vercel (React)                       │
│ https://reversi-psi-two.vercel.app   │
└────────────┬─────────────────────────┘
             │ /api/* → Tunnel
             ↓
┌──────────────────────────────────────┐
│ Cloudflare Tunnel                    │
│ (quick tunnel, URL changes on restart)
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│ Local Backend (.NET)                 │
│ http://localhost:5210                │
│ • Minimal API                        │
│ • SQLite database                    │
│ • Game engine                        │
└──────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `START_REVERSI.cmd` | Launch script (run this) |
| `_RunBackendReversi.cmd` | Backend startup script |
| `Front/vercel.json` | Vercel config (update tunnel URL here) |
| `Back/Reversi.Api/Program.cs` | .NET API entry point |
| `Front/src/` | React frontend |

## Troubleshooting

**API returns 502:**
- API not running? Double-click `START_REVERSI.cmd`
- Tunnel URL stale in `vercel.json`? Restart and update it

**Tunnel offline after restart:**
- That's normal! Cloudflare quick tunnels generate new URLs each restart
- Solution: Update `vercel.json` with the new URL and push

**Want permanent online deployment?**
- Use Railway or Render (see `RENDER_DEPLOYMENT.md` for instructions)

---

**Built with:** React 19 + TypeScript + Vite | .NET 10 + C# | SQLite
